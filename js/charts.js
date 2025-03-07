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

    // Clean up any existing resize handlers
    if (window.chartResizeHandlers && window.chartResizeHandlers[containerId]) {
        window.removeEventListener('resize', window.chartResizeHandlers[containerId]);
    }

    // Initialize the handlers object if it doesn't exist
    if (!window.chartResizeHandlers) {
        window.chartResizeHandlers = {};
    }

    container.innerHTML = '';

    let cumulativeXP = 0;
    const chartData = data.map(item => {
        cumulativeXP += item.amount
        return {
            date: new Date(item.createdAt),
            xp: cumulativeXP
        };
    });

    if (chartData.length === 0) {
        container.textContent = 'No XP data available';
        return;
    }

    // Get container width dynamically - RESPONSIVE APPROACH
    const containerWidth = container.clientWidth || 320;
    const isSmallScreen = containerWidth < 500;

    // Calculate aspect ratio for height - maintain proportions on resize
    const aspectRatio = 0.6; // height = 60% of width

    // Dynamic margins based on screen size
    const margin = {
        top: 20,
        right: isSmallScreen ? 10 : 20,
        bottom: 40,
        left: isSmallScreen ? 40 : 60
    };

    // Dynamic width and height based on container
    const width = containerWidth - margin.left - margin.right;
    const height = Math.min(containerWidth * aspectRatio, 300) - margin.top - margin.bottom;

    // Create SVG with viewBox for responsive scaling
    const svg = createSVGElement('svg', {
        width: "100%",
        height: "100%",
        viewBox: `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`,
        preserveAspectRatio: "xMidYMid meet"
    });

    // Create group for chart elements with margin
    const g = createSVGElement('g', {
        transform: `translate(${margin.left},${margin.top})`
    });
    svg.appendChild(g);

    // Find min and max values for scales
    const minDate = chartData[0].date;
    const maxDate = chartData[chartData.length - 1].date;
    const maxXP = chartData[chartData.length - 1].xp;

    // Create x and y scales
    const xScale = (date) => {
        return ((date - minDate) / (maxDate - minDate)) * width;
    };

    const yScale = (xp) => {
        return height - (xp / maxXP * height);
    };

    // Create axes
    // X axis
    const xAxis = createSVGElement('g', {
        transform: `translate(0,${height})`
    });
    g.appendChild(xAxis);

    const xAxisLine = createSVGElement('line', {
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        stroke: '#333',
        'stroke-width': 1
    });
    xAxis.appendChild(xAxisLine);

    // X axis labels - adjust number of labels based on width
    const labelCount = isSmallScreen ? 3 : 5;

    for (let i = 0; i <= labelCount; i++) {
        const date = new Date(minDate.getTime() + (maxDate.getTime() - minDate.getTime()) * (i / labelCount));
        const x = xScale(date);

        // Tick
        const tick = createSVGElement('line', {
            x1: x,
            y1: 0,
            x2: x,
            y2: 5,
            stroke: '#333',
            'stroke-width': 1
        });
        xAxis.appendChild(tick);

        // Label - use shorter date format on small screens
        const label = createSVGElement('text', {
            x: x,
            y: 20,
            'text-anchor': 'middle',
            'font-size': isSmallScreen ? '8px' : '10px'
        });

        // Format dates differently based on screen size
        if (isSmallScreen) {
            // Short format for small screens: "Jan 1" or "1/1"
            label.textContent = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } else {
            // Regular format for larger screens
            label.textContent = date.toLocaleDateString();
        }

        xAxis.appendChild(label);
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

    // Y axis labels - adjust number of ticks based on height
    const yLabelCount = isSmallScreen ? 3 : 5;

    for (let i = 0; i <= yLabelCount; i++) {
        const xp = maxXP * (i / yLabelCount);
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
            'font-size': isSmallScreen ? '8px' : '10px'
        });

        // Format XP values to be more readable on small screens
        // Use "k" for thousands on small screens
        label.textContent = isSmallScreen && xp >= 1000 ?
            `${Math.round(xp / 1000)}k` :
            Math.round(xp);

        yAxis.appendChild(label);
    }

    // Y axis title - adjust position for small screens
    const yAxisTitle = createSVGElement('text', {
        transform: `translate(${isSmallScreen ? -30 : -50},${height / 2}) rotate(-90)`,
        'text-anchor': 'middle',
        'font-size': isSmallScreen ? '10px' : '12px'
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
        'stroke-width': isSmallScreen ? 1.5 : 2
    });
    g.appendChild(line);

    // Add data points - adjust size for small screens
    const pointRadius = isSmallScreen ? 3 : 4;

    chartData.forEach((point) => {
        const circle = createSVGElement('circle', {
            cx: xScale(point.date),
            cy: yScale(point.xp),
            r: pointRadius,
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

    // Create a properly debounced resize handler
    const debounceResizeHandler = () => {
        if (debounceResizeHandler.timeout) {
            clearTimeout(debounceResizeHandler.timeout);
        }
        
        debounceResizeHandler.timeout = setTimeout(() => {
            // Only redraw if container width has changed
            const newWidth = container.clientWidth;
            if (newWidth !== containerWidth) {
                requestAnimationFrame(() => {
                    createXPProgressChart(data, containerId);
                });
            }
        }, 250); // Wait 250ms after resize stops before redrawing
    };

    // Store the handler reference to clean it up later
    window.chartResizeHandlers[containerId] = debounceResizeHandler;
    
    // Add the event listener
    window.addEventListener('resize', debounceResizeHandler);
}

function createProjectSuccessChart(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const passCount = data.filter(item => item.grade >= 1).length;
    const failCount = data.length - passCount;

    if (passCount + failCount === 0) {
        container.textContent = 'No project data available';
        return;
    }

    // Chart dimensions
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2

    const svg = createSVGElement('svg', {
        width,
        height,
        viewBox: `0 0 ${width} ${height}`
    })

    // Create group for chart elements centered in the SVG
    const g = createSVGElement('g', {
        transform: `translate(${width / 2},${height / 2})`
    });
    svg.appendChild(g);

    // Calculate angles for the donut chart
    const total = passCount + failCount;
    const passAngle = (passCount / total) * 360;
    const failAngle = (failCount / total) * 360;

    // Handle 100% case specially
    if (passCount === total) {
        const outerCircle = createSVGElement('circle', {
            cx: 0,
            cy: 0,
            r: radius,
            fill: '#2ecc71' // Pass color
        });
        g.appendChild(outerCircle);

        // Create inner circle for donut hole
        const innerCircle = createSVGElement('circle', {
            cx: 0,
            cy: 0,
            r: radius * 0.6,
            fill: 'white' // Background color
        });
        g.appendChild(innerCircle);
    }
    else if (failCount === total) {
        // Create a complete donut for 100% fail
        const outerCircle = createSVGElement('circle', {
            cx: 0,
            cy: 0,
            r: radius,
            fill: '#e74c3c' // Fail color
        });
        g.appendChild(outerCircle);

        // Create inner circle for donut hole
        const innerCircle = createSVGElement('circle', {
            cx: 0,
            cy: 0,
            r: radius * 0.6,
            fill: 'white' // Background color
        });
        g.appendChild(innerCircle);
    } else {

        // Create arc paths
        // Helper function to calculate arc path
        function describeArc(startAngle, endAngle, innerRadius, outerRadius) {
            const startRadians = (startAngle - 90) * Math.PI / 180;
            const endRadians = (endAngle - 90) * Math.PI / 180;

            const innerStartX = innerRadius * Math.cos(startRadians);
            const innerStartY = innerRadius * Math.sin(startRadians);
            const innerEndX = innerRadius * Math.cos(endRadians);
            const innerEndY = innerRadius * Math.sin(endRadians);

            const outerStartX = outerRadius * Math.cos(startRadians);
            const outerStartY = outerRadius * Math.sin(startRadians);
            const outerEndX = outerRadius * Math.cos(endRadians);
            const outerEndY = outerRadius * Math.sin(endRadians);

            const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

            const pathData = [
                `M ${innerStartX} ${innerStartY}`,
                `L ${outerStartX} ${outerStartY}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEndX} ${outerEndY}`,
                `L ${innerEndX} ${innerEndY}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStartX} ${innerStartY}`,
                'Z'
            ].join(' ');

            return pathData;
        }

        // Pass segment
        if (passCount > 0) {
            const passArc = createSVGElement('path', {
                d: describeArc(0, passAngle, radius * 0.6, radius),
                fill: '#2ecc71'
            });
            g.appendChild(passArc);
        }

        // Fail segment
        if (failCount > 0) {
            const failArc = createSVGElement('path', {
                d: describeArc(passAngle, 360, radius * 0.6, radius),
                fill: '#e74c3c'
            });
            g.appendChild(failArc);
        }
    }

    // Add text in the center
    const centerText = createSVGElement('text', {
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        'font-size': '18px',
        'font-weight': 'bold'
    });
    centerText.textContent = `${Math.round((passCount / total) * 100)}%`;
    g.appendChild(centerText);

    const subText = createSVGElement('text', {
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        y: 25,
        'font-size': '14px'
    });
    subText.textContent = 'Success Rate';
    g.appendChild(subText);

    // Add legend
    const legend = createSVGElement('g', {
        transform: `translate(${-radius},${radius / 2 + 30})`
    });
    g.appendChild(legend);

    // Pass legend
    const passLegendRect = createSVGElement('rect', {
        x: 0,
        y: 0,
        width: 15,
        height: 15,
        fill: '#2ecc71'
    });
    legend.appendChild(passLegendRect);

    const passLegendText = createSVGElement('text', {
        x: 20,
        y: 12,
        'font-size': '12px'
    });
    passLegendText.textContent = `Pass (${passCount})`;
    legend.appendChild(passLegendText);

    // Fail legend
    const failLegendRect = createSVGElement('rect', {
        x: 0,
        y: 25,
        width: 15,
        height: 15,
        fill: '#e74c3c'
    });
    legend.appendChild(failLegendRect);

    const failLegendText = createSVGElement('text', {
        x: 20,
        y: 37,
        'font-size': '12px'
    });
    failLegendText.textContent = `Fail (${failCount})`;
    legend.appendChild(failLegendText);

    container.appendChild(svg);
}

