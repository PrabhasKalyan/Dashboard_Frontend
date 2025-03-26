"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"

interface ScatterPlotProps {
  data: any[]
  colorBy?: "sector" | "pestle" // Allow coloring by sector or pestle
}

export default function ScatterPlot({ data, colorBy = "sector" }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; content: string } | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 50 }
    const width = svgRef.current.clientWidth - margin.left - margin.right
    const height = svgRef.current.clientHeight - margin.top - margin.bottom

    // Create SVG
    const svg = d3.select(svgRef.current).append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Create scales
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.likelihood) || 5])
      .nice()
      .range([0, width])

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.intensity) || 10])
      .nice()
      .range([height, 0])

    // Get unique categories for coloring
    const categories = Array.from(new Set(data.map((d) => d[colorBy] || "Unknown")))

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>().domain(categories).range(d3.schemeCategory10)

    // Add horizontal grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(-width)
          .tickFormat(() => ""),
      )
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .attr("stroke", "currentColor")

    // Add vertical grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(x)
          .tickSize(-height)
          .tickFormat(() => ""),
      )
      .attr("stroke-opacity", 0.1)
      .selectAll("line")
      .attr("stroke", "currentColor")

    // Add x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.bottom - 10)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Likelihood")

    // Add y-axis
    svg
      .append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .text("Intensity")

    // Add scatter points
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.likelihood))
      .attr("cy", (d) => y(d.intensity))
      .attr("r", 6)
      .attr("fill", (d) => colorScale(d[colorBy] || "Unknown"))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 8).attr("opacity", 1).attr("stroke-width", 2)

        const [mouseX, mouseY] = d3.pointer(event)

        setTooltip({
          x: mouseX,
          y: mouseY,
          content: `
            <strong>Title:</strong> ${d.title.substring(0, 50)}${d.title.length > 50 ? "..." : ""}<br/>
            <strong>Intensity:</strong> ${d.intensity}<br/>
            <strong>Likelihood:</strong> ${d.likelihood}<br/>
            <strong>${colorBy === "sector" ? "Sector" : "PESTLE"}:</strong> ${d[colorBy] || "Unknown"}<br/>
            <strong>Country:</strong> ${d.country || "Global"}<br/>
            <strong>Year:</strong> ${d.start_year || "N/A"}
          `,
        })
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 6).attr("opacity", 0.7).attr("stroke-width", 1)

        setTooltip(null)
      })

    // Add quadrant lines
    const midX = x(3) // Middle of likelihood scale (1-5)
    const midY = y(5) // Middle of intensity scale (1-10)

    // Horizontal line
    svg
      .append("line")
      .attr("x1", 0)
      .attr("y1", midY)
      .attr("x2", width)
      .attr("y2", midY)
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4")
      .attr("stroke-width", 1)

    // Vertical line
    svg
      .append("line")
      .attr("x1", midX)
      .attr("y1", 0)
      .attr("x2", midX)
      .attr("y2", height)
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4")
      .attr("stroke-width", 1)

    // Add quadrant labels
    svg
      .append("text")
      .attr("x", midX - 10)
      .attr("y", midY - 10)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "gray")
      .text("Low Impact, Low Likelihood")

    svg
      .append("text")
      .attr("x", midX + 10)
      .attr("y", midY - 10)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "gray")
      .text("Low Impact, High Likelihood")

    svg
      .append("text")
      .attr("x", midX - 10)
      .attr("y", midY + 20)
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .attr("fill", "gray")
      .text("High Impact, Low Likelihood")

    svg
      .append("text")
      .attr("x", midX + 10)
      .attr("y", midY + 20)
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("fill", "gray")
      .text("High Impact, High Likelihood")

    // Add legend
    const legend = svg
      .selectAll(".legend")
      .data(categories.slice(0, 10)) // Limit to 10 categories for readability
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (d, i) => `translate(0,${i * 20})`)

    legend
      .append("rect")
      .attr("x", width - 18)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => colorScale(d))
      .attr("rx", 2)

    legend
      .append("text")
      .attr("x", width - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("font-size", "10px")
      .text((d) => d)
  }, [data, colorBy])

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} width="100%" height="100%"></svg>
      {tooltip && (
        <div
          className="absolute bg-white dark:bg-gray-800 p-2 rounded shadow-lg border text-xs z-10"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 10}px`,
            maxWidth: "250px",
          }}
          dangerouslySetInnerHTML={{ __html: tooltip.content }}
        />
      )}
    </div>
  )
}

