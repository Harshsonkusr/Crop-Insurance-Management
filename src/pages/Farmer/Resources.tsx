import React from 'react';
import { Link } from 'react-router-dom';

const Resources: React.FC = () => {
  const resourceCategories = [
    {
      name: 'Claim Submission Guide',
      description: 'Step-by-step guides on how to submit various types of claims.',
      articles: [
        { title: 'How to Submit a Crop Damage Claim', link: '/resources/crop-damage-claim' },
        { title: 'Understanding the Claim Process Flow', link: '/resources/claim-process' },
        { title: 'Required Documents for Livestock Loss', link: '/resources/livestock-documents' },
      ],
    },
    {
      name: 'Understanding Your Policy',
      description: 'Detailed explanations of policy terms, coverage, and benefits.',
      articles: [
        { title: 'Your Policy: Terms and Conditions Explained', link: '/resources/policy-terms' },
        { title: 'Maximizing Your Coverage Benefits', link: '/resources/coverage-benefits' },
        { title: 'Renewing Your Farm Insurance Policy', link: '/resources/policy-renewal' },
      ],
    },
    {
      name: 'Damage Prevention Tips',
      description: 'Best practices and tips to prevent common farm damages.',
      articles: [
        { title: 'Protecting Crops from Pests and Diseases', link: '/resources/crop-protection' },
        { title: 'Weather Preparedness for Farmers', link: '/resources/weather-prep' },
        { title: 'Equipment Maintenance Checklist', link: '/resources/equipment-maintenance' },
      ],
    },
    {
      name: 'Financial Assistance & Grants',
      description: 'Information on available financial aid and grants for farmers.',
      articles: [
        { title: 'Government Grants for Sustainable Farming', link: '/resources/sustainable-grants' },
        { title: 'Emergency Relief Funds for Farmers', link: '/resources/emergency-funds' },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-4 animate-fade-in">
      <h1 className="text-3xl font-bold text-primary-green mb-6 border-b-2 border-primary-green pb-2 text-center">Resources</h1>

      <div className="space-y-8">
        {resourceCategories.map((category, index) => (
          <div key={index} className="bg-card-background shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">{category.name}</h2>
            <p className="text-gray-600 mb-4">{category.description}</p>
            <ul className="list-disc list-inside space-y-2">
              {category.articles.map((article, artIndex) => (
                <li key={artIndex}>
                  <Link to={article.link} className="text-primary-green hover:underline inline-flex items-center justify-center rounded-full font-bold py-2 px-4 transition ease-in-out transform hover:-translate-y-1 hover:scale-105">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;