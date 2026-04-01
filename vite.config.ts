import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import os from 'node:os'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { aliyunSpeechProxy } from './vite.aliyun-speech'

function isPrivateIpv4(address: string) {
  return (
    address.startsWith('192.168.') ||
    address.startsWith('10.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(address)
  )
}

function getPreferredLanIp() {
  const interfaces = os.networkInterfaces()
  const preferredInterfaceNames = ['en0', 'en1', 'wlan0', 'wifi0', 'eth0']

  for (const preferredName of preferredInterfaceNames) {
    for (const network of interfaces[preferredName] ?? []) {
      if (network.family === 'IPv4' && !network.internal && isPrivateIpv4(network.address)) {
        return network.address
      }
    }
  }

  for (const [interfaceName, networkGroup] of Object.entries(interfaces)) {
    if (/^(utun|awdl|llw|lo)/.test(interfaceName)) {
      continue
    }

    for (const network of networkGroup ?? []) {
      if (network.family === 'IPv4' && !network.internal && isPrivateIpv4(network.address)) {
        return network.address
      }
    }
  }

  return ''
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))
  const port = 5173
  const lanIp = getPreferredLanIp()

  return {
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      aliyunSpeechProxy(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port,
      allowedHosts: true,
    },
    define: {
      __APP_LAN_ORIGIN__: JSON.stringify(lanIp ? `http://${lanIp}:${port}` : ''),
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
