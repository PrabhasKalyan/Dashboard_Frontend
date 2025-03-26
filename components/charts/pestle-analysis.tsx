"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface PestleAnalysisProps {
  data: any[]
}

export default function PestleAnalysis({ data }: PestleAnalysisProps) {
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

    // Process data - count insights by PESTLE category
    const pestleCounts = {}
    data.forEach((d) => {
      const pestle = d.pestle || "Unknown"
      pestleCounts[pestle] = (pestleCounts[pestle] || 0) + 1
    })

    // Convert to array and sort by count
    const chartData = Object.entries(pestleCounts)
      .map(([pestle, count]) => ({ pestle, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeSet2).domain(chartData.map((d) => d.pestle))

    // Create pie chart
    const pie = d3
      .pie<any>()
      .value((d) => d.count)
      .sort(null)

    const arc = d3
      .arc<any>()
      .innerRadius(radius * 0.5) // Create a donut chart
      .outerRadius(radius)

    // Add slices
    const slices = svg.selectAll(".slice").data(pie(chartData)).enter().append("g").attr("class", "slice")

    slices
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => colorScale(d.data.pestle))
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
          .text(`${d.data.pestle}: ${d.data.count}`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1)
        svg.selectAll(".tooltip").remove()
      })

    // Add labels
    const labelArc = d3
      .arc<any>()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7)

    slices
      .append("text")
      .attr("transform", (d) => `translate(${labelArc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("font-size", "10px")
      .text((d) => d.data.pestle)

    // Add center text
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("PESTLE")

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
      .attr("fill", (d) => colorScale(d.pestle))

    legend
      .append("text")
      .attr("x", width / 2 - 24)
      .attr("y", 6)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .text((d) => `${d.pestle} (${d.count})`)
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

