import express from 'express';
import { verifyMetaSignature } from './security.js';
import { extractWebhookEvents } from './events.js';
import { isGreeting, buildGreetingResponse } from './greeting.js';

function captureRawBody(req, _res, buffer) {
  req.rawBody = Buffer.from(buffer);
}

export function createApp({ config, logger = console, onWebhookEvent = async () => {}, messenger = null, conversation = null, storage = null }) {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json({ limit: '1mb', verify: captureRawBody }));

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'elimfilters-whatsapp-bot'
    });
  });

  app.get('/webhooks/whatsapp', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.verifyToken && challenge) {
      logger.info('Meta webhook verification completed');
      return res.status(200).type('text/plain').send(String(challenge));
    }

    logger.warn('Rejected Meta webhook verification request');
    return res.sendStatus(403);
  });

  app.post('/webhooks/whatsapp', async (req, res, next) => {
    try {
      const signatureValid = verifyMetaSignature({
        rawBody: req.rawBody,
        signatureHeader: req.get('x-hub-signature-256'),
        appSecret: config.appSecret
      });

      if (!signatureValid) {
        logger.warn('Rejected webhook with invalid Meta signature');
        return res.sendStatus(401);
      }

      if (req.body?.object !== 'whatsapp_business_account') {
        logger.warn('Rejected unsupported webhook object');
        return res.sendStatus(404);
      }

      const events = extractWebhookEvents(req.body);
      await onWebhookEvent({ payload: req.body, events });

      // Process messages with conversation flow if available
      if (messenger && conversation && storage) {
        logger.info('Processing messages with full conversation flow', {
          eventCount: events.length
        });

        for (const event of events) {
          if (event.kind === 'message' && event.message?.type === 'text') {
            const messageText = event.message.text?.body;
            const senderPhone = event.message.from;
            const contactName = event.contacts?.[0]?.profile?.name;

            logger.info('Incoming message received', {
              from: senderPhone,
              messagePreview: messageText?.substring(0, 100),
              contactName
            });

            try {
              logger.debug('Calling conversation.processMessage');
              const result = await conversation.processMessage(senderPhone, messageText, contactName);

              if (!result?.response) {
                logger.error('processMessage returned empty response', {
                  to: senderPhone,
                  result: JSON.stringify(result)
                });
                continue;
              }

              logger.debug('Sending text via messenger', {
                to: senderPhone,
                responsePreview: result.response?.substring(0, 100)
              });
              await messenger.sendText({ to: senderPhone, body: result.response });

              logger.info('Processed message and sent response', {
                to: senderPhone,
                contactName,
                state: result.state,
                responseLength: result.response?.length || 0
              });
            } catch (error) {
              logger.error('Failed to process message', {
                to: senderPhone,
                messagePreview: messageText?.substring(0, 100),
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
              });
            }
          }
        }
      } else if (messenger) {
        // Fallback to basic greeting if full conversation flow is not available
        for (const event of events) {
          if (event.kind === 'message' && event.message?.type === 'text') {
            const messageText = event.message.text?.body;
            const senderPhone = event.message.from;
            const contactName = event.contacts?.[0]?.profile?.name;

            if (isGreeting(messageText)) {
              const greetingText = buildGreetingResponse(contactName);
              try {
                await messenger.sendText({ to: senderPhone, body: greetingText });
                logger.info('Sent greeting response', { to: senderPhone, contactName });
              } catch (error) {
                logger.error('Failed to send greeting response', {
                  to: senderPhone,
                  error: error instanceof Error ? error.message : String(error)
                });
              }
            }
          }
        }
      }

      return res.sendStatus(200);
    } catch (error) {
      return next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    logger.error('Unhandled request error', {
      message: error instanceof Error ? error.message : String(error)
    });

    if (!res.headersSent) {
      res.sendStatus(500);
    }
  });

  return app;
}
