"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface SectorDistributionProps {
  data: any[]
}

export default function SectorDistribution({ data }: SectorDistributionProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 20, right: 120, bottom: 40, left: 120 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = svgRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Process data - count insights by sector
    const sectorCounts = {}
    data.forEach((d) => {
      const sector = d.sector || "Unknown"
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
    })

    // Convert to array and sort by count
    let chartData = Object.entries(sectorCounts)
      .map(([sector, count]) => ({ sector, count }))
      .sort((a, b) => (b.count as number) - (a.count as number))

    // Limit to top 10 sectors for readability
    if (chartData.length > 10) {
      const otherCount = chartData.slice(10).reduce((sum, item) => sum + (item.count as number), 0)
      chartData = [...chartData.slice(0, 10), { sector: "Other", count: otherCount }]
    }

    // Create scales
    const y = d3
      .scaleBand()
      .domain(chartData.map((d) => d.sector))
      .range([0, height])
      .padding(0.1)

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count as number) as number])
      .nice()
      .range([0, width])

    // Create and add y-axis
    svg.append("g").call(d3.axisLeft(y))

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
      .text("Number of Insights")

    // Create color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(chartData.map((d) => d.sector))

    // Add vertical grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisBottom(x)
          .tickSize(height)
          .tickFormat(() => ""),
      )
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .attr("stroke", "currentColor")

    // Add bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("y", (d) => y(d.sector) as number)
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d.count as number))
      .attr("fill", (d) => colorScale(d.sector))
      .attr("rx", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8)

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", x(d.count as number) + 5)
          .attr("y", (y(d.sector) as number) + y.bandwidth() / 2)
          .attr("dy", ".35em")
          .attr("text-anchor", "start")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`${d.count}`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 1)
        svg.selectAll(".tooltip").remove()
      })

    // Add count labels
    svg
      .selectAll(".count")
      .data(chartData)
      .enter()
      .append("text")
      .attr("class", "count")
      .attr("x", (d) => x(d.count as number) - 5)
      .attr("y", (d) => (y(d.sector) as number) + y.bandwidth() / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "white")
      .text((d) => d.count)
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

