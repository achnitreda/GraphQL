const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

function createSVGElement(tag, attributes = {}) {
    const element = document.createElementNS(SVG_NAMESPACE, tag)
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value)
    }
    return element
}

function createXPProgressChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    let cumulativeXP = 0;
    const chartData = data.map(item => {
        cumulativeXP += item.amount
        return {
            date: new Date(item.createdAt),
            xp: cumulativeXP
        };
    })

    if (chartData.length === 0) {
        container.textContent = 'No XP data available';
        return;
    }

    // DEBUG
    console.log("chartData ->", chartData)

    // Chart dimensions
    const margin = { top: 20, right: 20, buttom: 40, left: 60 }
    const width = 500 - margin.left - margin.right
    const height = 300 - margin.top - margin.buttom

    // Create SVG
    const svg = createSVGElement('svg', {
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.buttom,
    })

    // Create group for chart elements with margin
    const g = createSVGElement('g', {
        transform: `translate(${margin.left},${margin.top})`
    })
    svg.appendChild(g)

    // Find min and max values for scales
    const minDate = chartData[0].date
    const maxDate = chartData[chartData.length - 1].date

    const maxXP = chartData[chartData.length - 1].xp;

    // Create x and y scales
    // For x scale (dates), we map date range to pixel range
    const xScale = (date) => {
        return ((date - minDate) / (maxDate - minDate)) * width
    }

    // For y scale (XP), we map XP range to pixel range
    const yScale = (xp) => {
        return height - (xp / maxXP * height)
    }

    // Create axes
    // X axis
    const xAxis = createSVGElement('g', {
        transform: `translate(0,${height})`
    })
    g.appendChild(xAxis)

    const xAxisLine = createSVGElement('line', {
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        stroke: '#333',
        'stroke-width': 1
    })
    xAxis.appendChild(xAxisLine)

    // X axis labels
    // We'll show 5 date labels evenly spaced
    for (i = 0; i <= 5; i++) {
        const date = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) * (i / 5))

        const x = xScale(date);

        // Tick
        const tick = createSVGElement('line', {
            x1: x,
            y1: 0,
            x2: x,
            y2: 5,
            stroke: '#333',
            'stroke-width': 1
        })
        xAxis.appendChild(tick)

        // Label
        const label = createSVGElement('text', {
            x: x,
            y: 20,
            'text-anchor': 'middle',
            'font-size': '10px'
        })
        label.textContent = date.toLocaleDateString()
        xAxis.appendChild(label)
    }

    // Y axis
    const yAxis = createSVGElement('g');
    g.appendChild(yAxis);

    const yAxisLine = createSVGElement('line', {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: height,
        stroke: '#333',
        'stroke-width': 1
    });
    yAxis.appendChild(yAxisLine);

    for (let i = 0; i <= 5; i++) {
        const xp = maxXP * (i / 5);
        const y = yScale(xp);

        const tick = createSVGElement('line', {
            x1: -5,
            y1: y,
            x2: 0,
            y2: y,
            stroke: '#333',
            'stroke-width': 1
        });
        yAxis.appendChild(tick);

        const label = createSVGElement('text', {
            x: -10,
            y: y + 4,
            'text-anchor': 'end',
            'font-size': '10px'
        });
        label.textContent = xp;
        yAxis.appendChild(label);
    }

    // Y axis title
    const yAxisTitle = createSVGElement('text', {
        transform: `translate(-50,${height / 2}) rotate(-90)`,
        'text-anchor': 'middle',
        'font-size': '12px'
    });
    yAxisTitle.textContent = 'Total XP';
    yAxis.appendChild(yAxisTitle);

    // Create line
    let linePath = `M${xScale(chartData[0].date)},${yScale(chartData[0].xp)}`;
    for (let i = 1; i < chartData.length; i++) {
        linePath += ` L${xScale(chartData[i].date)},${yScale(chartData[i].xp)}`;
    }

    const line = createSVGElement('path', {
        d: linePath,
        fill: 'none',
        stroke: '#3498db',
        'stroke-width': 2,
    })
    g.appendChild(line)

    // Add data points
    chartData.forEach((point) => {
        const circle = createSVGElement('circle', {
            cx: xScale(point.date),
            cy: yScale(point.xp),
            r: 4,
            fill: '#3498db'
        });

        // Add tooltip on hover
        circle.addEventListener('mouseenter', (e) => {
            const tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - 30}px`;
            tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.fontSize = '12px';
            tooltip.style.zIndex = '1000';
            tooltip.textContent = `Date: ${point.date.toLocaleDateString()}, XP: ${point.xp}`;
            document.body.appendChild(tooltip);

            circle.addEventListener('mouseleave', () => {
                document.body.removeChild(tooltip);
            });
        });

        g.appendChild(circle);
    });

    container.appendChild(svg);
}