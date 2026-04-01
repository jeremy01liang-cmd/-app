
  # 儿童学习app首页设计

  This is a code bundle for 儿童学习app首页设计. The original project is available at https://www.figma.com/design/QN9cQXjluvuZsXm5RaZebd/%E5%84%BF%E7%AB%A5%E5%AD%A6%E4%B9%A0app%E9%A6%96%E9%A1%B5%E8%AE%BE%E8%AE%A1.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  If you need to scan the parent QR code on a phone, prefer opening the site with the LAN address, or set `VITE_PARENT_PORTAL_PUBLIC_ORIGIN` to a phone-accessible domain or IP, for example:

  `VITE_PARENT_PORTAL_PUBLIC_ORIGIN=http://192.168.1.20:5173`

  ## iOS engineering

  This project now uses Capacitor to wrap the Vite app into a native iOS shell.

  Run `npm run ios:add` once to create the native iOS project if `ios/` does not exist yet.

  Run `npm run ios:sync` after web changes to rebuild `dist/` and sync it into the native project.

  Run `npm run ios:open` to open the generated Xcode project.

  The current Capacitor app id is a placeholder: `com.codex.learningplus`. Change it in `capacitor.config.json` before App Store release if you need your formal bundle identifier.

  ## Speech backend for production

  The Aliyun speech feature used to exist only inside the Vite dev server. For production and iOS builds, run a standalone backend:

  `npm run speech:server`

  The server exposes:

  `GET /health`

  `POST /api/aliyun-speech/tts`

  `POST /api/aliyun-speech/asr`

  Configure the frontend to call your deployed backend by setting:

  `VITE_SPEECH_API_ORIGIN=https://your-api-domain.example.com`

  For Capacitor iOS builds, you should point `VITE_SPEECH_API_ORIGIN` to an HTTPS origin. Relative `/api/...` routes are only suitable when your web app and backend are served from the same origin.

  ### Deploy options

  The repo now includes a standalone Docker deployment for the speech service:

  `Dockerfile`

  `docker-compose.speech.yml`

  Local container test:

  `docker compose -f docker-compose.speech.yml up --build`

  Health check:

  `curl http://127.0.0.1:8787/health`

  Required production environment variables:

  `ALIYUN_AK_ID`

  `ALIYUN_AK_SECRET`

  `ALIYUN_NLS_APP_KEY`

  Optional:

  `ALIYUN_NLS_TOKEN`

  `ALIYUN_NLS_REGION`

  `ALIYUN_NLS_VOICE`

  `SPEECH_CORS_ORIGINS`

  `PORT`

  Recommended rollout order:

  1. Deploy the speech container behind an HTTPS domain.
  2. Add your iOS/Web origin to `SPEECH_CORS_ORIGINS`.
  3. Set `VITE_SPEECH_API_ORIGIN` to that HTTPS domain.
  4. Rebuild the app and run `npm run ios:sync`.
  
