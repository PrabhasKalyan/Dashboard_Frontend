"use client"

import { useState, useEffect } from "react"
import {
  Filter,
  BarChart3,
  PieChart,
  Calendar,
  Globe,
  Layers,
  FileText,
  ScatterChartIcon as ScatterPlotIcon,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

import IntensityChart from "./charts/intensity-chart"
import LikelihoodChart from "./charts/likelihood-chart"
import RegionMap from "./charts/region-map"
import TopicsChart from "./charts/topics-chart"
import YearTrend from "./charts/year-trend"
import SectorDistribution from "./charts/sector-distribution"
import PestleAnalysis from "./charts/pestle-analysis"
import ScatterPlot from "./charts/scatter-plot"
import axios from "axios";
// import { sampleData } from "@/data/sample-data"



export default function Dashboard() {
  const [sampleData, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/data/");
        setData(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);
  // const [data, setData] = useState(sampleData)
  const [filteredData, setFilteredData] = useState(sampleData)
  const [filters, setFilters] = useState({
    endYear: "",
    topics: "",
    sector: "",
    region: "",
    pestle: "",
    source: "",
    country: "",
    city: "",
  })
  const [colorBy, setColorBy] = useState<"sector" | "pestle">("sector")

  // Apply filters when they change
  useEffect(() => {
    let result = [...sampleData]

    if (filters.endYear && filters.endYear !== "all") {
      result = result.filter((item) => item.end_year === filters.endYear)
    }

    if (filters.topics && filters.topics !== "all") {
      result = result.filter((item) => item.topic.toLowerCase().includes(filters.topics.toLowerCase()))
    }

    if (filters.sector && filters.sector !== "all") {
      result = result.filter((item) => item.sector === filters.sector)
    }

    if (filters.region && filters.region !== "all") {
      result = result.filter((item) => item.region === filters.region)
    }

    if (filters.pestle && filters.pestle !== "all") {
      result = result.filter((item) => item.pestle === filters.pestle)
    }

    if (filters.source && filters.source !== "all") {
      result = result.filter((item) => item.source === filters.source)
    }

    if (filters.country && filters.country !== "all") {
      result = result.filter((item) => item.country === filters.country)
    }

    setFilteredData(result)
  }, [filters])

  // Get unique values for filters
  const getUniqueValues = (field) => {
    return [...new Set(sampleData.map((item) => item[field]).filter(Boolean))]
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      endYear: "",
      topics: "",
      sector: "",
      region: "",
      pestle: "",
      source: "",
      country: "",
      city: "",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-2xl font-bold">Global Insights Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => document.documentElement.classList.toggle("dark")}>
              Toggle Theme
            </Button>
          </div>
        </div>
      </header>
      <div className="container py-6">
        <div className="grid gap-6">
          <div className="flex flex-col md:flex-row gap-4 items-start">
            <Card className="w-full md:w-64 shrink-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
                <CardDescription>Refine dashboard data</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="end-year" className="text-sm font-medium">
                    End Year
                  </label>
                  <Select value={filters.endYear} onValueChange={(value) => handleFilterChange("endYear", value)}>
                    <SelectTrigger id="end-year">
                      <SelectValue placeholder="Select end year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {getUniqueValues("end_year").map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="topics" className="text-sm font-medium">
                    Topics
                  </label>
                  <Select value={filters.topics} onValueChange={(value) => handleFilterChange("topics", value)}>
                    <SelectTrigger id="topics">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {getUniqueValues("topic").map((topic) => (
                        <SelectItem key={topic} value={topic}>
                          {topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="sector" className="text-sm font-medium">
                    Sector
                  </label>
                  <Select value={filters.sector} onValueChange={(value) => handleFilterChange("sector", value)}>
                    <SelectTrigger id="sector">
                      <SelectValue placeholder="Select sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {getUniqueValues("sector").map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="region" className="text-sm font-medium">
                    Region
                  </label>
                  <Select value={filters.region} onValueChange={(value) => handleFilterChange("region", value)}>
                    <SelectTrigger id="region">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      {getUniqueValues("region").map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="pestle" className="text-sm font-medium">
                    PEST
                  </label>
                  <Select value={filters.pestle} onValueChange={(value) => handleFilterChange("pestle", value)}>
                    <SelectTrigger id="pestle">
                      <SelectValue placeholder="Select PEST category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {getUniqueValues("pestle").map((pestle) => (
                        <SelectItem key={pestle} value={pestle}>
                          {pestle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="source" className="text-sm font-medium">
                    Source
                  </label>
                  <Select value={filters.source} onValueChange={(value) => handleFilterChange("source", value)}>
                    <SelectTrigger id="source">
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {getUniqueValues("source").map((source) => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country
                  </label>
                  <Select value={filters.country} onValueChange={(value) => handleFilterChange("country", value)}>
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {getUniqueValues("country").map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>

            <div className="flex-1 grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{filteredData.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {filteredData.length === sampleData.length
                        ? "Showing all insights"
                        : `Filtered from ${sampleData.length} total`}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Intensity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(filteredData.reduce((sum, item) => sum + item.intensity, 0) / filteredData.length || 0).toFixed(
                        1,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Scale: 1-10</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Likelihood</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(
                        filteredData.reduce((sum, item) => sum + item.likelihood, 0) / filteredData.length || 0
                      ).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Scale: 1-5</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Relevance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {(filteredData.reduce((sum, item) => sum + item.relevance, 0) / filteredData.length || 0).toFixed(
                        1,
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Scale: 1-5</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="charts">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="charts">Charts</TabsTrigger>
                  <TabsTrigger value="map">Geographic</TabsTrigger>
                  <TabsTrigger value="analysis">Risk Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="charts" className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Intensity Distribution
                        </CardTitle>
                        <CardDescription>Frequency of intensity values</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <IntensityChart data={filteredData} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Likelihood Analysis
                        </CardTitle>
                        <CardDescription>Distribution of likelihood scores</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <LikelihoodChart data={filteredData} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="h-5 w-5" />
                          Topics Distribution
                        </CardTitle>
                        <CardDescription>Breakdown by topic</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <TopicsChart data={filteredData} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Year Trend Analysis
                        </CardTitle>
                        <CardDescription>Insights over time</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <YearTrend data={filteredData} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Layers className="h-5 w-5" />
                          Sector Distribution
                        </CardTitle>
                        <CardDescription>Breakdown by sector</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <SectorDistribution data={filteredData} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          PESTLE Analysis
                        </CardTitle>
                        <CardDescription>Distribution by PESTLE category</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <PestleAnalysis data={filteredData} />
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="map">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Regional Distribution
                      </CardTitle>
                      <CardDescription>Insights by geographic region</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px]">
                      <RegionMap data={filteredData} />
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="analysis">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ScatterPlotIcon className="h-5 w-5" />
                        Intensity vs. Likelihood Analysis
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>Identify high-risk events for strategic prioritization</span>
                        <Select value={colorBy} onValueChange={(value: "sector" | "pestle") => setColorBy(value)}>
                          <SelectTrigger className="w-[180px] h-8">
                            <SelectValue placeholder="Color by" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sector">Color by Sector</SelectItem>
                            <SelectItem value="pestle">Color by PESTLE</SelectItem>
                          </SelectContent>
                        </Select>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[600px]">
                      <ScatterPlot data={filteredData} colorBy={colorBy} />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

