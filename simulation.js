import mqtt from 'mqtt'

const client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', () => {
    console.log('🚀 Simulation Started on Linux! Press Ctrl+C to stop.')

    setInterval(() => {
        const temp = (25 + Math.random() * 15).toFixed(1)
        const humid = (40 + Math.random() * 40).toFixed(1)

        console.log(`Sending -> Temp: ${temp}°C, Humid: ${humid}%`)

        client.publish('devops/film/temp', temp)
        client.publish('devops/film/humid', humid)
    }, 2000)
})