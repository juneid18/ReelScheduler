import React, { useState, useEffect, useCallback, memo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Skeleton,
  useTheme,
  Tabs,
  Tab,
  Paper,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Visibility as ViewsIcon,
  WatchLater as WatchTimeIcon,
  AccessTime as AvgDurationIcon,
  PersonAdd as SubscribersIcon,
  Timeline as LineChartIcon,
  PieChart as PieChartIcon,
  Devices as DevicesIcon,
  CalendarMonthTwoTone,
  Refresh,
} from "@mui/icons-material";
import { analyticsService } from "../services/analyticsService";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import EmptyStateIllustration from "../assets/undraw_growth-chart_h2w8.svg";
import { IoIosAnalytics } from "react-icons/io";

// Styled components
const AnalyticsContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: theme.shadows[6],
  },
}));

const ChartCard = styled(StyledCard)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

const TimeframeSelect = styled(Select)(({ theme }) => ({
  minWidth: 160,
  backgroundColor: theme.palette.background.paper,
  "& .MuiSelect-select": {
    padding: theme.spacing(1, 2),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    "&:focus": {
      border: `2px solid ${theme.palette.primary.main}`,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}50`,
  },
}}));

const SummaryValue = styled(Typography)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)"
      : "linear-gradient(45deg, #1976D2 30%, #2196F3 90%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontWeight: 700,
}));

const COLORS = ["#1976d2", "#4caf50", "#ff9800", "#e91e63", "#9c27b0"];
const ICONS = [
  <ViewsIcon />,
  <WatchTimeIcon />,
  <AvgDurationIcon />,
  <SubscribersIcon />,
];

// Reusable components
const SummaryCard = memo(({ title, value, unit, icon, index }) => {
  const theme = useTheme();
  const iconColor = COLORS[index % COLORS.length];

  return (
    <StyledCard role="region" aria-label={title}>
      <CardContent sx={{ position: "relative", textAlign: "center" }}>
        <Avatar
          sx={{
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.grey[800]
                : theme.palette.grey[100],
            color: iconColor,
            mb: 2,
            width: 48,
            height: 48,
          }}
        >
          {icon}
        </Avatar>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <SummaryValue variant="h4" component="div">
          {value}
          {unit && (
            <Typography component="span" variant="body2" color="text.secondary">
              {" "}
              {unit}
            </Typography>
          )}
        </SummaryValue>
      </CardContent>
    </StyledCard>
  );
});

const ErrorDisplay = ({ error, onRetry }) => (
  <Alert
    severity="error"
    action={
      <Button color="inherit" size="small" onClick={onRetry}>
        Retry
      </Button>
    }
    sx={{ mt: 4, width: "100%" }}
    role="alert"
  >
    {error}
  </Alert>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          {label}
        </Typography>
        {payload.map((item, index) => (
          <Typography key={index} variant="body2" color={item.color}>
            {item.name}: {item.value.toLocaleString()}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const ChartTabs = ({ value, onChange }) => {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 3 }}
    >
      <Tab label="Views" icon={<LineChartIcon />} iconPosition="start" />
      <Tab
        label="Traffic Sources"
        icon={<PieChartIcon />}
        iconPosition="start"
      />
      <Tab label="Devices" icon={<DevicesIcon />} iconPosition="start" />
    </Tabs>
  );
};

/**
 * Analytics component to display YouTube channel analytics.
 * @returns {JSX.Element}
 */
const Analytics = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState("7days");
  const [activeTab, setActiveTab] = useState(0);

  const timeframes = [
    { value: "7days", label: "Last 7 Days" },
    { value: "30days", label: "Last 30 Days" },
    { value: "90days", label: "Last 90 Days" },
  ];

  // Fetch analytics data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsService.getYouTubeAnalytics(timeframe);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError(res.data.message || "Failed to fetch analytics data");
      }
    } catch (err) {      
      setError(err || "An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render loading, error, or no data states
  if (loading)
    return (
      <AnalyticsContainer>
        <LoadingSpinner />
      </AnalyticsContainer>
    );
  if (error)
    return (
      <AnalyticsContainer>
        <ErrorDisplay error={error} onRetry={fetchData} />
      </AnalyticsContainer>
    );
  if (!data || !data.totals)
    return (
      <AnalyticsContainer className="flex justify-center items-center flex-col">
        <img
          src={EmptyStateIllustration}
          alt="No data"
          style={{ width: 300, marginBottom: 24 }}
        />
        <Typography variant="h6" mt={4} textAlign="center">
          No analytics data available for this timeframe
        </Typography>
        <Button
          variant="outlined"
          onClick={fetchData}
          startIcon={<Refresh fontSize="small" />}
          sx={{
            mt: 2,
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
            },
          }}
        >
          Refresh
        </Button>
      </AnalyticsContainer>
    );

  return (
    <AnalyticsContainer>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              {/* Title section with icon */}
              <div className="flex items-center gap-3">
                <IoIosAnalytics
                  className="text-2xl text-primary-600"
                  aria-hidden="true"
                />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  YouTube Analytics <span className="text-gray-500">(Beta)</span>
                </h1>
              </div>
            </div>
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" color="text.secondary">
              {data.channelTitle}
            </Typography>
            <Chip
              label={timeframes.find((t) => t.value === timeframe)?.label}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
        <TimeframeSelect
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          variant="outlined"
          aria-label="Select timeframe"
        >
          {timeframes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TimeframeSelect>
      </Box>

      {/* Date Range */}
      <Typography
        variant="subtitle2"
        display="block"
        color="text.secondary"
        gutterBottom
      >
        <Box
          component="span"
          sx={{ whiteSpace: "nowrap", display: "flex", alignItems: "center" }}
        >
          <CalendarMonthTwoTone />
          {new Date(data.startDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          –
          {new Date(data.endDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Box>
      </Typography>

      <Divider sx={{ my: 4 }} />

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Total Views"
            value={data.totals.views.toLocaleString()}
            icon={ICONS[0]}
            index={0}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Watch Time"
            value={Math.round(data.totals.estimatedMinutesWatched)}
            unit="mins"
            icon={ICONS[1]}
            index={1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Avg. View Duration"
            value={Math.round(data.totals.averageViewDuration)}
            unit="secs"
            icon={ICONS[2]}
            index={2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            title="Subscribers Gained"
            value={data.totals.subscribersGained.toLocaleString()}
            icon={ICONS[3]}
            index={3}
          />
        </Grid>
      </Grid>

      {/* Chart Navigation */}
      <ChartTabs value={activeTab} onChange={handleTabChange} />

      {/* Charts */}
      {activeTab === 0 && (
        <ChartCard sx={{ mb: 4 }} role="region" aria-label="Daily Views Chart">
          <Typography variant="h6" gutterBottom>
            Daily Views
          </Typography>
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.dailyData}
                margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="views"
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  name="Views"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </ChartCard>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard role="region" aria-label="Traffic Sources Chart">
              <Typography variant="h6" gutterBottom>
                Traffic Sources
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width={800} height="100%">
                  <PieChart>
                    <Pie
                      data={data.trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill={COLORS[0]}
                      dataKey="views"
                      nameKey="trafficSource"
                      label={({ name, percent }) =>
                        `${name.replace(/_/g, " ")}: ${(percent * 100).toFixed(
                          0
                        )}%`
                      }
                    >
                      {data.trafficSources.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ paddingLeft: 20 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ChartCard role="region" aria-label="Devices Chart">
              <Typography variant="h6" gutterBottom>
                Devices
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width={800} height="100%">
                  <BarChart
                    data={data.devices}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={theme.palette.divider}
                    />
                    <XAxis
                      type="number"
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      dataKey="deviceType"
                      type="category"
                      width={100}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="views"
                      fill={COLORS[0]}
                      name="Views"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </ChartCard>
          </Grid>
        </Grid>
      )}
    </AnalyticsContainer>
  );
};

export default Analytics;
