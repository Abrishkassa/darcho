"use client";

import { BarChart3 } from "lucide-react";
import EmptyState from "../components/EmptyState";

export default function BuyerInsightsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="mt-1 text-gray-600">
          Spending analytics, price trends, and purchasing patterns
        </p>
      </div>

      <EmptyState
        icon={BarChart3}
        title="Insights are coming soon"
        description="We are working on spend analytics, market price trends, and personalized purchasing insights for your account."
      />
    </div>
  );
}
