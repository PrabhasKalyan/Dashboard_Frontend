"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface YearTrendProps {
  data: any[]
}

export default function YearTrend({ data }: YearTrendProps) {
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

    // Process data - count insights by year
    const yearCounts = {}

    // Use start_year if available, otherwise use published year
    data.forEach((d) => {
      let year = d.start_year
      if (!year && d.published) {
        year = d.published.split(",")[1].trim().split(" ")[0]
      }

      if (year) {
        yearCounts[year] = (yearCounts[year] || 0) + 1
      }
    })

    // Convert to array and sort by year
    const chartData = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year))

    // Create scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.year))
      .range([0, width])
      .padding(0.1)

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, (d) => d.count as number) as number])
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
      .text("Year")

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
      .text("Number of Insights")

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

    // Create line generator
    const line = d3
      .line<any>()
      .x((d) => (x(d.year) as number) + x.bandwidth() / 2)
      .y((d) => y(d.count))
      .curve(d3.curveMonotoneX)

    // Add line
    svg
      .append("path")
      .datum(chartData)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add dots
    svg
      .selectAll(".dot")
      .data(chartData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => (x(d.year) as number) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.count as number))
      .attr("r", 5)
      .attr("fill", "#3b82f6")
      .on("mouseover", function (event, d) {
        d3.select(this).attr("r", 7).attr("fill", "#2563eb")

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (x(d.year) as number) + x.bandwidth() / 2)
          .attr("y", y(d.count as number) - 15)
          .attr("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .text(`${d.year}: ${d.count}`)
      })
      .on("mouseout", function () {
        d3.select(this).attr("r", 5).attr("fill", "#3b82f6")

        svg.selectAll(".tooltip").remove()
      })
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

