"use client"

import { useEffect, useRef } from "react"
import * as d3 from "d3"
import * as topojson from "topojson-client"

interface RegionMapProps {
  data: any[]
}

export default function RegionMap({ data }: RegionMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!data.length || !svgRef.current) return

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove()

    // Set dimensions
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height)
      .attr("style", "max-width: 100%; height: auto;")

    // Create a group for the map
    const g = svg.append("g")

    // Create a projection
    const projection = d3
      .geoNaturalEarth1()
      .scale(width / 6)
      .translate([width / 2, height / 2])

    // Create a path generator
    const path = d3.geoPath().projection(projection)

    // Load world map data
    Promise.all([d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")]).then(([world]) => {
      if (!world) return

      // Process data - count insights by region
      const regionCounts = {}
      data.forEach((d) => {
        const region = d.region
        if (region) {
          regionCounts[region] = (regionCounts[region] || 0) + 1
        }
      })

      // Extract countries from topojson
      const countries = topojson.feature(world as any, (world as any).objects.countries)

      // Create color scale
      const colorScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(Object.values(regionCounts) as number[]) || 1])

      // Draw countries
      g.selectAll("path")
        .data((countries as any).features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("fill", "#e5e7eb")
        .attr("stroke", "#d1d5db")
        .attr("stroke-width", 0.5)

      // Add circles for regions with data
      const regionCoordinates = {
        "Northern America": [-100, 40],
        "South America": [-60, -20],
        Europe: [15, 50],
        Asia: [100, 30],
        Africa: [20, 0],
        World: [0, 0],
        Oceania: [130, -25],
      }

      // Add circles for regions
      Object.entries(regionCounts).forEach(([region, count]) => {
        if (regionCoordinates[region]) {
          const [x, y] = projection(regionCoordinates[region]) || [0, 0]

          // Add circle
          g.append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", Math.sqrt(count as number) * 5)
            .attr("fill", colorScale(count as number))
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .attr("opacity", 0.8)
            .on("mouseover", function () {
              d3.select(this).attr("opacity", 1).attr("stroke-width", 2)

              // Add tooltip
              g.append("text")
                .attr("class", "tooltip")
                .attr("x", x)
                .attr("y", y - Math.sqrt(count as number) * 5 - 10)
                .attr("text-anchor", "middle")
                .attr("font-size", "12px")
                .attr("font-weight", "bold")
                .text(`${region}: ${count}`)
            })
            .on("mouseout", function () {
              d3.select(this).attr("opacity", 0.8).attr("stroke-width", 1)

              g.selectAll(".tooltip").remove()
            })

          // Add region label
          g.append("text")
            .attr("x", x)
            .attr("y", y + Math.sqrt(count as number) * 5 + 15)
            .attr("text-anchor", "middle")
            .attr("font-size", "10px")
            .text(region)
        }
      })

      // Add zoom functionality
      const zoom = d3
        .zoom()
        .scaleExtent([1, 8])
        .on("zoom", (event) => {
          g.attr("transform", event.transform)
        })

      svg.call(zoom as any)
    })
  }, [data])

  return <svg ref={svgRef} width="100%" height="100%"></svg>
}

