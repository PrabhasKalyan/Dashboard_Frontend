"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface IntensityChartProps {
  data: any[]
}

export default function IntensityChart({ data }: IntensityChartProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 40, left: 40 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = svgRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Process data - count frequency of each intensity value
    const intensityCounts = {}
    data.forEach((d) => {
      const intensity = d.intensity
      intensityCounts[intensity] = (intensityCounts[intensity] || 0) + 1
    })

    const chartData = Object.entries(intensityCounts).map(([intensity, count]) => ({
      intensity: +intensity,
      count: +count,
    }))

    // Sort by intensity
    chartData.sort((a, b) => a.intensity - b.intensity)

    // Create scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.intensity.toString()))
      .range([0, width])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count) as number])
      .nice()
      .range([height, 0])

    // Create and add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 5)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Intensity")

    // Create and add y-axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 10)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Frequency")

    // Create color scale
    const colorScale = d3
      .scaleLinear<string>()
      .domain([d3.min(chartData, (d) => d.intensity) as number, d3.max(chartData, (d) => d.intensity) as number])
      .range(["#60a5fa", "#2563eb"])

    // Add bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.intensity.toString()) as number)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", (d) => colorScale(d.intensity))
      .attr("rx", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8)

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (x(d.intensity.toString()) as number) + x.bandwidth() / 2)
          .attr("y", y(d.count) - 10)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`Count: ${d.count}`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1)
        svg.selectAll(".tooltip").remove()
      })
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

