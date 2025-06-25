const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const Chart = require('chart.js/auto');

const chartService = {
    async generateChart(chartType, data, options = {}) {
        const width = options.width || 800;
        const height = options.height || 400;

        const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

        const configuration = {
            type: chartType,
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: options.title || 'Analytics Chart'
                    }
                },
                ...options
            }
        };

        const image = await chartJSNodeCanvas.renderToBuffer(configuration);
        return image;
    },

    generateEngagementChart(data) {
        return {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Engagement Rate',
                    data: data.map(d => d.engagement_rate),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                title: 'Engagement Rate Over Time',
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        };
    },

    generateViewsChart(data) {
        return {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Views',
                    data: data.map(d => d.views),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    borderWidth: 1
                }]
            },
            options: {
                title: 'Content Views Over Time'
            }
        };
    }
};

module.exports = chartService;