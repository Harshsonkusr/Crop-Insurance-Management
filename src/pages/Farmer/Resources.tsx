import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  FileText, 
  Shield, 
  TrendingUp,
  AlertCircle,
  Download,
  ExternalLink,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const Resources: React.FC = () => {
  const resourceCategories = [
    {
      name: 'Claim Submission Guide',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Step-by-step guides on how to submit various types of claims.',
      articles: [
        { 
          title: 'How to Submit a Crop Damage Claim', 
          description: 'Complete guide to submitting crop damage claims with all required documents.',
          link: '/resources/crop-damage-claim',
          type: 'guide'
        },
        { 
          title: 'Understanding the Claim Process Flow', 
          description: 'Learn about the complete claim processing workflow from submission to settlement.',
          link: '/resources/claim-process',
          type: 'guide'
        },
        { 
          title: 'Required Documents for Claims', 
          description: 'Checklist of all documents needed for different types of insurance claims.',
          link: '/resources/claim-documents',
          type: 'checklist'
        },
        { 
          title: 'Photo Guidelines for Damage Claims', 
          description: 'Best practices for taking photos that help with claim verification.',
          link: '/resources/photo-guidelines',
          type: 'guide'
        },
      ],
    },
    {
      name: 'Understanding Your Policy',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Detailed explanations of policy terms, coverage, and benefits.',
      articles: [
        { 
          title: 'Your Policy: Terms and Conditions Explained', 
          description: 'Comprehensive explanation of policy terms, coverage limits, and exclusions.',
          link: '/resources/policy-terms',
          type: 'guide'
        },
        { 
          title: 'Maximizing Your Coverage Benefits', 
          description: 'Tips on how to get the most out of your insurance coverage.',
          link: '/resources/coverage-benefits',
          type: 'tips'
        },
        { 
          title: 'Renewing Your Farm Insurance Policy', 
          description: 'Step-by-step guide to policy renewal and what to consider.',
          link: '/resources/policy-renewal',
          type: 'guide'
        },
        { 
          title: 'Understanding Premium Calculations', 
          description: 'Learn how your insurance premium is calculated based on various factors.',
          link: '/resources/premium-calculation',
          type: 'guide'
        },
      ],
    },
    {
      name: 'PMFBY & Government Schemes',
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Information about PMFBY and other government agricultural insurance schemes.',
      articles: [
        { 
          title: 'PMFBY: Complete Overview', 
          description: 'Everything you need to know about Pradhan Mantri Fasal Bima Yojana.',
          link: '/resources/pmfby-overview',
          type: 'info'
        },
        { 
          title: 'Eligibility Criteria for PMFBY', 
          description: 'Check if you qualify for PMFBY and understand the requirements.',
          link: '/resources/pmfby-eligibility',
          type: 'info'
        },
        { 
          title: 'Government Subsidies and Benefits', 
          description: 'Available subsidies and financial assistance programs for farmers.',
          link: '/resources/government-subsidies',
          type: 'info'
        },
      ],
    },
    {
      name: 'Damage Prevention Tips',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Best practices and tips to prevent common farm damages.',
      articles: [
        { 
          title: 'Protecting Crops from Pests and Diseases', 
          description: 'Effective strategies to prevent and manage crop pests and diseases.',
          link: '/resources/crop-protection',
          type: 'tips'
        },
        { 
          title: 'Weather Preparedness for Farmers', 
          description: 'How to prepare your farm for extreme weather conditions.',
          link: '/resources/weather-prep',
          type: 'tips'
        },
        { 
          title: 'Crop Insurance Best Practices', 
          description: 'Best practices for maintaining crop insurance and maximizing benefits.',
          link: '/resources/insurance-best-practices',
          type: 'tips'
        },
      ],
    },
    {
      name: 'Financial Assistance & Grants',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Information on available financial aid and grants for farmers.',
      articles: [
        { 
          title: 'Government Grants for Sustainable Farming', 
          description: 'Available grants and financial support for sustainable farming practices.',
          link: '/resources/sustainable-grants',
          type: 'info'
        },
        { 
          title: 'Emergency Relief Funds for Farmers', 
          description: 'How to access emergency relief funds during natural disasters.',
          link: '/resources/emergency-funds',
          type: 'info'
        },
        { 
          title: 'Loan Schemes for Farmers', 
          description: 'Government loan schemes and financial assistance programs.',
          link: '/resources/farmer-loans',
          type: 'info'
        },
      ],
    },
  ];

  const getTypeBadge = (type: string) => {
    const typeConfig: { [key: string]: { label: string; variant: "default" | "secondary" | "outline" } } = {
      'guide': { label: 'Guide', variant: 'default' },
      'tips': { label: 'Tips', variant: 'secondary' },
      'info': { label: 'Info', variant: 'outline' },
      'checklist': { label: 'Checklist', variant: 'default' },
    };
    const config = typeConfig[type] || { label: type, variant: 'outline' as const };
    return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resources & Guides</h1>
        <p className="text-gray-600">
          Access helpful guides, documentation, and information to make the most of your insurance coverage
        </p>
      </div>

      {/* Resource Categories */}
      <div className="space-y-6">
        {resourceCategories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle>{category.name}</CardTitle>
                    <CardDescription className="mt-1">{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.articles.map((article, artIndex) => (
                    <div
                      key={artIndex}
                      className="p-4 border rounded-lg hover:border-green-500 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                          {article.title}
                        </h3>
                        {getTypeBadge(article.type)}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {article.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => {
                          // TODO: Implement navigation or modal
                          alert(`Opening: ${article.title}`);
                        }}
                      >
                        Read More
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              className="justify-start h-auto py-4"
              onClick={() => window.open('https://pmfby.gov.in', '_blank')}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              PMFBY Official Website
            </Button>
            <Button
              variant="secondary"
              className="justify-start h-auto py-4"
              onClick={() => window.open('https://agriculture.gov.in', '_blank')}
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Ministry of Agriculture
            </Button>
            <Button
              variant="secondary"
              className="justify-start h-auto py-4"
              onClick={() => alert('Downloading claim form...')}
            >
              <Download className="h-5 w-5 mr-2" />
              Download Claim Form
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Resources;
