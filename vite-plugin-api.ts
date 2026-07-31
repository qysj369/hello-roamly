import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin, ViteDevServer } from 'vite';
import { loadEnv } from 'vite';
import { WebSocketServer } from 'ws';

type ApiHandler = (req: IncomingMessage, res: ServerResponse, rootDir: string) => Promise<void>;

type ApiRoute = {
  method: string;
  path: string;
  modulePath: string;
  exportName: string;
};

const API_ROUTES: ApiRoute[] = [
  {
    method: 'GET',
    path: '/api/travel-buddies',
    modulePath: '/server/api/travel-buddies/handler.ts',
    exportName: 'handleTravelBuddiesApi',
  },
  {
    method: 'POST',
    path: '/api/travel-buddies',
    modulePath: '/server/api/travel-buddies/handler.ts',
    exportName: 'handleTravelBuddiesApi',
  },
  {
    method: 'GET',
    path: '/api/buddy-messages',
    modulePath: '/server/api/buddy-messages/handler.ts',
    exportName: 'handleBuddyMessagesApi',
  },
  {
    method: 'POST',
    path: '/api/buddy-messages',
    modulePath: '/server/api/buddy-messages/handler.ts',
    exportName: 'handleBuddyMessagesApi',
  },
  {
    method: 'GET',
    path: '/api/user/plans',
    modulePath: '/server/api/user/plans.ts',
    exportName: 'handleUserPlansApi',
  },
  {
    method: 'POST',
    path: '/api/user/plans',
    modulePath: '/server/api/user/plans.ts',
    exportName: 'handleUserPlansApi',
  },
  {
    method: 'GET',
    path: '/api/drive-videos',
    modulePath: '/server/api/drive-videos/handler.ts',
    exportName: 'handleDriveVideosApi',
  },
  {
    method: 'POST',
    path: '/api/drive-videos',
    modulePath: '/server/api/drive-videos/handler.ts',
    exportName: 'handleDriveVideosApi',
  },
  {
    method: 'GET',
    path: '/api/drive-videos/file',
    modulePath: '/server/api/drive-videos/handler.ts',
    exportName: 'handleDriveVideosApi',
  },
  {
    method: 'POST',
    path: '/api/drive-videos/moderate',
    modulePath: '/server/api/drive-videos/handler.ts',
    exportName: 'handleDriveVideosApi',
  },
];

function matchApiRoute(url: string | undefined, method: string | undefined): ApiRoute | null {
  if (!url || !method) {
    return null;
  }
  const pathname = url.split('?')[0] ?? '';
  return API_ROUTES.find((route) => route.path === pathname && route.method === method) ?? null;
}

type GuideApiModule = {
  handleGenerateGuideApi: (
    req: IncomingMessage,
    res: ServerResponse,
    env: Record<string, string | undefined>,
  ) => Promise<void>;
};

type PlanApiModule = {
  handleGeneratePlanApi: GuideApiModule['handleGenerateGuideApi'];
};

type DeepSeekPlanApiModule = {
  handleDeepSeekPlanApi: GuideApiModule['handleGenerateGuideApi'];
};

type ContinuePlanChatApiModule = {
  handleContinuePlanChatApi: GuideApiModule['handleGenerateGuideApi'];
};

type ChatStreamApiModule = {
  handleChatStreamApi: GuideApiModule['handleGenerateGuideApi'];
};

type PlanStreamApiModule = {
  handleGeneratePlanStreamApi: GuideApiModule['handleGenerateGuideApi'];
};

type PlanToolsApiModule = {
  handlePlanToolsApi: GuideApiModule['handleGenerateGuideApi'];
};

type ContinuePlanChatStreamApiModule = {
  handleContinuePlanChatStreamApi: GuideApiModule['handleGenerateGuideApi'];
};

type SpeechTranscribeApiModule = {
  handleSpeechTranscribeApi: GuideApiModule['handleGenerateGuideApi'];
};

type SpeechWarmupApiModule = {
  handleSpeechWarmupApi: GuideApiModule['handleGenerateGuideApi'];
};

type SpeechConfigApiModule = {
  handleSpeechConfigApi: GuideApiModule['handleGenerateGuideApi'];
};

type TravelPlanApiModule = {
  handleGenerateTravelPlanApi: GuideApiModule['handleGenerateGuideApi'];
};

function loadHandler(
  server: ViteDevServer,
  route: ApiRoute,
  cache: Map<string, Promise<ApiHandler>>,
): Promise<ApiHandler> {
  const cacheKey = `${route.modulePath}:${route.exportName}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const promise = server
    .ssrLoadModule(route.modulePath)
    .then((mod) => mod[route.exportName] as ApiHandler);
  cache.set(cacheKey, promise);
  return promise;
}

async function loadGuideApiHandler(server: ViteDevServer): Promise<GuideApiModule['handleGenerateGuideApi']> {
  const mod = (await server.ssrLoadModule('/server/api/ai/generate-guide.ts')) as GuideApiModule;
  return mod.handleGenerateGuideApi;
}

async function loadPlanApiHandler(server: ViteDevServer): Promise<PlanApiModule['handleGeneratePlanApi']> {
  const mod = (await server.ssrLoadModule('/server/api/ai/generate-plan.ts')) as PlanApiModule;
  return mod.handleGeneratePlanApi;
}

async function loadDeepSeekPlanApiHandler(
  server: ViteDevServer,
): Promise<DeepSeekPlanApiModule['handleDeepSeekPlanApi']> {
  const mod = (await server.ssrLoadModule('/server/api/ai/deepseek.ts')) as DeepSeekPlanApiModule;
  return mod.handleDeepSeekPlanApi;
}

async function loadContinuePlanChatApiHandler(
  server: ViteDevServer,
): Promise<ContinuePlanChatApiModule['handleContinuePlanChatApi']> {
  const mod = (await server.ssrLoadModule('/server/api/ai/continue-chat.ts')) as ContinuePlanChatApiModule;
  return mod.handleContinuePlanChatApi;
}

function mountApiMiddleware(server: ViteDevServer): void {
  const env = loadEnv(server.config.mode, server.config.root, '');
  for (const [key, value] of Object.entries(env)) {
    if (value !== undefined) {
      process.env[key] = value;
    }
  }
  const rootDir = server.config.root;
  const handlerCache = new Map<string, Promise<ApiHandler>>();
  let guideHandlerPromise: Promise<GuideApiModule['handleGenerateGuideApi']> | null = null;
  let planHandlerPromise: Promise<PlanApiModule['handleGeneratePlanApi']> | null = null;
  let deepseekPlanHandlerPromise: Promise<DeepSeekPlanApiModule['handleDeepSeekPlanApi']> | null = null;
  let continuePlanChatHandlerPromise: Promise<ContinuePlanChatApiModule['handleContinuePlanChatApi']> | null =
    null;
  let chatStreamHandlerPromise: Promise<ChatStreamApiModule['handleChatStreamApi']> | null = null;
  let planStreamHandlerPromise: Promise<PlanStreamApiModule['handleGeneratePlanStreamApi']> | null =
    null;
  let planToolsHandlerPromise: Promise<PlanToolsApiModule['handlePlanToolsApi']> | null = null;
  let continuePlanChatStreamHandlerPromise:
    | Promise<ContinuePlanChatStreamApiModule['handleContinuePlanChatStreamApi']>
    | null = null;
  let speechTranscribeHandlerPromise:
    | Promise<SpeechTranscribeApiModule['handleSpeechTranscribeApi']>
    | null = null;
  let speechWarmupHandlerPromise:
    | Promise<SpeechWarmupApiModule['handleSpeechWarmupApi']>
    | null = null;
  let speechConfigHandlerPromise:
    | Promise<SpeechConfigApiModule['handleSpeechConfigApi']>
    | null = null;
  let travelPlanHandlerPromise:
    | Promise<TravelPlanApiModule['handleGenerateTravelPlanApi']>
    | null = null;

  const getGuideHandler = () => {
    if (!guideHandlerPromise) {
      guideHandlerPromise = loadGuideApiHandler(server);
    }
    return guideHandlerPromise;
  };

  const getPlanHandler = () => {
    if (!planHandlerPromise) {
      planHandlerPromise = loadPlanApiHandler(server);
    }
    return planHandlerPromise;
  };

  const getDeepSeekPlanHandler = () => {
    if (!deepseekPlanHandlerPromise) {
      deepseekPlanHandlerPromise = loadDeepSeekPlanApiHandler(server);
    }
    return deepseekPlanHandlerPromise;
  };

  const getContinuePlanChatHandler = () => {
    if (!continuePlanChatHandlerPromise) {
      continuePlanChatHandlerPromise = loadContinuePlanChatApiHandler(server);
    }
    return continuePlanChatHandlerPromise;
  };

  const getChatStreamHandler = () => {
    if (!chatStreamHandlerPromise) {
      chatStreamHandlerPromise = server
        .ssrLoadModule('/server/api/ai/chat-stream.ts')
        .then((mod) => (mod as ChatStreamApiModule).handleChatStreamApi);
    }
    return chatStreamHandlerPromise;
  };

  const getPlanStreamHandler = () => {
    if (!planStreamHandlerPromise) {
      planStreamHandlerPromise = server
        .ssrLoadModule('/server/api/ai/generate-plan-stream.ts')
        .then((mod) => (mod as PlanStreamApiModule).handleGeneratePlanStreamApi);
    }
    return planStreamHandlerPromise;
  };

  const getPlanToolsHandler = () => {
    if (!planToolsHandlerPromise) {
      planToolsHandlerPromise = server
        .ssrLoadModule('/server/api/ai/plan-tools.ts')
        .then((mod) => (mod as PlanToolsApiModule).handlePlanToolsApi);
    }
    return planToolsHandlerPromise;
  };

  const getContinuePlanChatStreamHandler = () => {
    if (!continuePlanChatStreamHandlerPromise) {
      continuePlanChatStreamHandlerPromise = server
        .ssrLoadModule('/server/api/ai/continue-chat-stream.ts')
        .then((mod) => (mod as ContinuePlanChatStreamApiModule).handleContinuePlanChatStreamApi);
    }
    return continuePlanChatStreamHandlerPromise;
  };

  const getSpeechTranscribeHandler = () => {
    if (!speechTranscribeHandlerPromise) {
      speechTranscribeHandlerPromise = server
        .ssrLoadModule('/server/api/ai/speech-transcribe.ts')
        .then((mod) => (mod as SpeechTranscribeApiModule).handleSpeechTranscribeApi);
    }
    return speechTranscribeHandlerPromise;
  };

  const getSpeechWarmupHandler = () => {
    if (!speechWarmupHandlerPromise) {
      speechWarmupHandlerPromise = server
        .ssrLoadModule('/server/api/ai/speech-warmup.ts')
        .then((mod) => (mod as SpeechWarmupApiModule).handleSpeechWarmupApi);
    }
    return speechWarmupHandlerPromise;
  };

  const getSpeechConfigHandler = () => {
    if (!speechConfigHandlerPromise) {
      speechConfigHandlerPromise = server
        .ssrLoadModule('/server/api/ai/speech-config.ts')
        .then((mod) => (mod as SpeechConfigApiModule).handleSpeechConfigApi);
    }
    return speechConfigHandlerPromise;
  };

  const getTravelPlanHandler = () => {
    if (!travelPlanHandlerPromise) {
      travelPlanHandlerPromise = server
        .ssrLoadModule('/server/api/ai/generate-travel-plan.ts')
        .then((mod) => (mod as TravelPlanApiModule).handleGenerateTravelPlanApi);
    }
    return travelPlanHandlerPromise;
  };

  server.middlewares.use((req, res, next) => {
    const route = matchApiRoute(req.url, req.method);
    if (route) {
      void loadHandler(server, route, handlerCache)
        .then((handler) => handler(req, res, rootDir))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    const pathname = req.url?.split('?')[0] ?? '';
    if (pathname === '/api/ai/generate-guide') {
      void getGuideHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/generate-travel-plan') {
      void getTravelPlanHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/deepseek') {
      void getDeepSeekPlanHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/generate-plan') {
      void getPlanHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/continue-chat') {
      void getContinuePlanChatHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/plan-tools') {
      void getPlanToolsHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/continue-chat-stream') {
      void getContinuePlanChatStreamHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          if (res.headersSent) {
            return;
          }
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/speech-transcribe') {
      void getSpeechTranscribeHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/speech-warmup') {
      void getSpeechWarmupHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/speech-config') {
      void getSpeechConfigHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/chat-stream') {
      void getChatStreamHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          if (res.headersSent) {
            return;
          }
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/ai/generate-plan-stream') {
      void getPlanStreamHandler()
        .then((handle) => handle(req, res, env))
        .catch((error: unknown) => {
          if (res.headersSent) {
            return;
          }
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/map/geocode-origin') {
      void server
        .ssrLoadModule('/server/api/map/geocode-origin.ts')
        .then((mod) =>
          (mod as { handleGeocodeOriginApi: GuideApiModule['handleGenerateGuideApi'] }).handleGeocodeOriginApi(
            req,
            res,
            env,
          ),
        )
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/user/plans' || pathname.startsWith('/api/user/plans/')) {
      void loadHandler(server, {
        method: req.method ?? 'GET',
        path: '/api/user/plans',
        modulePath: '/server/api/user/plans.ts',
        exportName: 'handleUserPlansApi',
      }, handlerCache)
        .then((handler) => handler(req, res, rootDir))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    if (pathname === '/api/user/ai-sessions' || pathname.startsWith('/api/user/ai-sessions/')) {
      void loadHandler(server, {
        method: req.method ?? 'GET',
        path: '/api/user/ai-sessions',
        modulePath: '/server/api/user/ai-sessions.ts',
        exportName: 'handleUserAiSessionsApi',
      }, handlerCache)
        .then((handler) => handler(req, res, rootDir))
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'API 处理失败';
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify({ error: message }));
        });
      return;
    }

    next();
  });
}

function mountSpeechStreamWebSocket(server: ViteDevServer): void {
  const speechStreamWss = new WebSocketServer({ noServer: true });
  let speechStreamHandlerPromise:
    | Promise<(typeof import('./server/api/ai/speech-stream-handler'))['handleSpeechStreamConnection']>
    | null = null;

  const getSpeechStreamHandler = () => {
    if (!speechStreamHandlerPromise) {
      speechStreamHandlerPromise = server
        .ssrLoadModule('/server/api/ai/speech-stream-handler.ts')
        .then((mod) => mod.handleSpeechStreamConnection);
    }
    return speechStreamHandlerPromise;
  };

  speechStreamWss.on('connection', (clientWs) => {
    void getSpeechStreamHandler()
      .then((handle) => handle(clientWs))
      .catch(() => {
        clientWs.close();
      });
  });

  server.httpServer?.on('upgrade', (request, socket, head) => {
    const pathname = request.url?.split('?')[0] ?? '';
    if (pathname !== '/api/ai/speech-stream') {
      return;
    }
    speechStreamWss.handleUpgrade(request, socket, head, (clientWs) => {
      speechStreamWss.emit('connection', clientWs, request);
    });
  });
}

/** 开发/预览态挂载站内 API（生产静态部署需另行接入同路径后端） */
export function apiPlugin(): Plugin {
  return {
    name: 'hello-roamly-api',
    configureServer(server) {
      mountApiMiddleware(server);
      mountSpeechStreamWebSocket(server);
    },
    configurePreviewServer(server) {
      mountApiMiddleware(server as ViteDevServer);
      mountSpeechStreamWebSocket(server as ViteDevServer);
    },
  };
}
