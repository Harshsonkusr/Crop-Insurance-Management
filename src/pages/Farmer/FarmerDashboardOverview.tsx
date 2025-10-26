import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Bell, Cloud, CheckCircle2, Clock, XCircle } from "lucide-react";

const DashboardOverview = () => {
  // Placeholder data for quick stats
  const quickStats = [
    { title: "Total Active Policies", value: "12", icon: <PlusCircle className="h-4 w-4 text-muted-foreground" /> },
    { title: "Pending Claims", value: "4", icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
    { title: "Approved Claims", value: "8", icon: <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> },
  ];

  // Placeholder data for payment summary
  const paymentSummary = [
    { date: "June 20", amount: "₹15000", status: "Paid" },
    { date: "May 15", amount: "₹12000", status: "Paid" },
    { date: "April 15", amount: "₹10000", status: "Paid" },
  ];

  // Placeholder data for recent activity
  const recentActivity = [
    { type: "Claim #IND123 Approved", date: "June 28, 2024", icon: <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" /> },
    { type: "New Policy Added: Monsoon Crop Insurance", date: "June 25, 2024", icon: <PlusCircle className="mr-2 h-4 w-4 text-blue-500" /> },
    { type: "Payment Received for Policy #IND5678", date: "June 20, 2024", icon: <Bell className="mr-2 h-4 w-4 text-yellow-500" /> },
  ];

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Dashboard Overview</h1>

      {/* Welcome Message */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold">Welcome, Farmer!</h2>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Farm Health Overview */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Farm Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-4">
              <img src="https://via.placeholder.com/400x200" alt="Farm Health" className="rounded-md w-full md:w-1/2 object-cover" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-4">
                  The AI-powered analysis of your farm's health is currently in progress. We're examining satellite imagery and weather data to provide you with the latest insights.
                </p>
                <div className="flex items-center text-blue-500 text-sm">
                  <Bell className="h-4 w-4 mr-2" /> AI verification results pending
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start">
                    {activity.icon}
                    <div>
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Next Premium Due */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Premium Due</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">October 2, 2024</div>
            </CardContent>
          </Card>

          {/* Weather & Insights */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Weather & Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2">
                <Cloud className="h-6 w-6 text-gray-500 mr-2" />
                <span className="text-2xl font-bold">35°C</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Partly Cloudy</p>
              <p className="text-xs text-gray-500 mb-4">Forecast: Scattered thunderstorms expected this afternoon.</p>
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Crop Suggestion: Good conditions for planting rice this week.
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentSummary.map((payment, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{payment.date}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{payment.amount}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card className="shadow-lg rounded-lg p-4 hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center p-3 rounded-md bg-yellow-50 text-yellow-700 text-sm">
                <Bell className="h-4 w-4 mr-2" /> Your premium for Policy #IND9101 is due in 7 days.
              </div>
              <div className="flex items-center p-3 rounded-md bg-blue-50 text-blue-700 text-sm">
                <Bell className="h-4 w-4 mr-2" /> New government scheme for farmer welfare announced. Check here for details.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Buttons */}
      <footer className="bg-white p-4 flex justify-center space-x-4 border-t">
        <Link to="/farmer-dashboard/submit-claim">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" /> New Claim
          </Button>
        </Link>
        <Link to="/farmer-dashboard/farm-details">
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle2 className="mr-2 h-4 w-4" /> Update Farm Details
          </Button>
        </Link>
        <Button className="bg-gray-600 hover:bg-gray-700 text-white">
          <Bell className="mr-2 h-4 w-4" /> Contact Support
        </Button>
      </footer>
    </div>
  );
};

export default DashboardOverview;
