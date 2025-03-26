"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface TopicsChartProps {
  data: any[]
}

export default function TopicsChart({ data }: TopicsChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const radius = Math.min(width, height) / 2 - 40

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`)

    // Process data - count insights by topic
    const topicCounts = {}
    data.forEach((d) => {
      const topic = d.topic
      if (topic) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1
      }
    })

    // Convert to array and sort by count
    let chartData = Object.entries(topicCounts)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))

    // Limit to top 8 topics for readability
    if (chartData.length > 8) {
      const otherCount = chartData.slice(8).reduce((sum, item) => sum + (item.count as number), 0)
      chartData = [...chartData.slice(0, 8), { topic: "Other", count: otherCount }]
    }

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

    // Create pie chart
    const pie = d3
      .pie<any>()
      .value((d) => d.count)
      .sort(null)

    const arc = d3.arc<any>().innerRadius(0).outerRadius(radius)

    const outerArc = d3
      .arc<any>()
      .innerRadius(radius * 1.1)
      .outerRadius(radius * 1.1)

    // Add slices
    const slices = svg.selectAll(".slice").data(pie(chartData)).enter().append("g").attr("class", "slice")

    slices
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => colorScale(i.toString()))
      .attr("stroke", "white")
      .style("stroke-width", "2px")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8)

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("text-anchor", "middle")
          .attr("font-size", "14px")
          .attr("font-weight", "bold")
          .text(`${d.data.topic}: ${d.data.count}`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1)
        svg.selectAll(".tooltip").remove()
      })

    // Add labels
    const labels = svg
      .selectAll(".label")
      .data(pie(chartData))
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", (d) => {
        const pos = outerArc.centroid(d)
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1)
        return `translate(${pos})`
      })
      .attr("dy", ".35em")
      .attr("text-anchor", (d) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
        return midAngle < Math.PI ? "start" : "end"
      })
      .attr("font-size", "10px")
      .text((d) => d.data.topic)

    // Add polylines
    const polylines = svg
      .selectAll(".polyline")
      .data(pie(chartData))
      .enter()
      .append("polyline")
      .attr("class", "polyline")
      .attr("points", (d) => {
        const pos = outerArc.centroid(d)
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
        pos[0] = radius * 0.95 * (midAngle < Math.PI ? 1 : -1)
        return [arc.centroid(d), outerArc.centroid(d), pos]
      })
      .attr("fill", "none")
      .attr("stroke", "gray")
      .attr("stroke-width", 1)
      .attr("opacity", 0.5)

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(chartData)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20 - height / 2 + 20})`)

    legend
      .append("rect")
      .attr("x", width / 2 - 18)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", (d, i) => colorScale(i.toString()))

    legend
      .append("text")
      .attr("x", width / 2 - 24)
      .attr("y", 6)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .text((d) => `${d.topic} (${d.count})`)
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

