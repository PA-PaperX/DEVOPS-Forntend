import { defineStore } from 'pinia'
import mqtt from 'mqtt'

export const useMqttStore = defineStore('mqtt', {
  state: () => ({
    client: null as mqtt.MqttClient | null,
    isConnected: false,
    temp: 0,
    humidity: 0,
    logs: [] as Array<{ timestamp: number, msg: string, type: 'info'|'warn'|'error' }>
  }),

  actions: {
    connect() {
      const config = useRuntimeConfig()
      const brokerUrl = config.public.mqttBrokerUrl

      if (this.client?.connected) return
      
      this.client = mqtt.connect(brokerUrl)

      this.client.on('connect', () => {
        this.isConnected = true
        this.addLog('Connected to MQTT Broker', 'info')
        this.client?.subscribe(['devops/film/temp', 'devops/film/humid'])
      })

      this.client.on('message', (topic, message) => {
        const val = parseFloat(message.toString())
        
        if (topic.includes('temp')) {
          this.temp = val
          if(val > 35) this.addLog(`High Temperature Alert: ${val}°C`, 'warn')
        } 
        else if (topic.includes('humid')) {
          this.humidity = val
        }
      })

      this.client.on('error', (err) => {
        this.addLog(`Connection Error: ${err.message}`, 'error')
      })

      this.client.on('close', () => {
        this.isConnected = false
      })
    },

    addLog(msg: string, type: 'info'|'warn'|'error' = 'info') {
      this.logs.unshift({ 
        timestamp: Date.now(), 
        msg, 
        type 
      })
      if (this.logs.length > 100) this.logs.pop()
    }
  }
})