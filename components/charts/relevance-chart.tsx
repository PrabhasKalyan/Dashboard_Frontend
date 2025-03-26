"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"

interface RelevanceChartProps {
  data: any[]
}

export default function RelevanceChart({ data }: RelevanceChartProps) {
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

    // Process data - count frequency of each relevance value
    const relevanceCounts = {}
    data.forEach((d) => {
      const relevance = d.relevance
      relevanceCounts[relevance] = (relevanceCounts[relevance] || 0) + 1
    })

    const chartData = Object.entries(relevanceCounts).map(([relevance, count]) => ({
      relevance: +relevance,
      count: +count,
    }))

    // Sort by relevance
    chartData.sort((a, b) => a.relevance - b.relevance)

    // Create scales
    const x = d3
      .scaleBand()
      .domain(chartData.map((d) => d.relevance.toString()))
      .range([0, width])
      .padding(0.2)

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
      .text("Relevance")

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
    const colorScale = d3.scaleLinear<string>().domain([1, 5]).range(["#f59e0b", "#d97706"])

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

    // Add bars
    svg
      .selectAll(".bar")
      .data(chartData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.relevance.toString()) as number)
      .attr("y", (d) => y(d.count))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.count))
      .attr("fill", (d) => colorScale(d.relevance))
      .attr("rx", 2)
      .on("mouseover", function (event, d) {
        d3.select(this).attr("opacity", 0.8)

        // Add tooltip
        svg
          .append("text")
          .attr("class", "tooltip")
          .attr("x", (x(d.relevance.toString()) as number) + x.bandwidth() / 2)
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

