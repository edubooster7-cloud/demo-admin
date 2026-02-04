"use client";

import {
  IconCreditCard,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useUsers } from "@/hooks/use-users";
import { Skeleton } from "./ui/skeleton";
import { useProvinces } from "@/hooks/use-province";
import { useSections } from "@/hooks/user-section";
import { useSubscriptions } from "@/hooks/use-subscriptions";
import { useCourses } from "@/hooks/use-courses";

export function SectionCards() {
  const { stats: userStats, isLoadingUsers } = useUsers();
  const { stats: provinceStats, isLoading: isLoadingProvinces } =
    useProvinces();
  const { stats: sectionStats, isLoading: isLoadingSections } = useSections();
  const { stats: subStats, isLoading: isLoadingSubs } = useSubscriptions();
  const { stats: courseStats, isLoading: isLoadingCourses } = useCourses();

  const isLoading =
    isLoadingUsers ||
    isLoadingProvinces ||
    isLoadingSections ||
    isLoadingSubs ||
    isLoadingCourses;

  const calculateGrowth = (month: number, total: number) =>
    total > 0 ? ((month / total) * 100).toFixed(1) : "0";

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-9 w-24 mt-2" />
              <CardAction>
                <Skeleton className="h-6 w-14 rounded-full" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 mt-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-5">
      {/* Utilisateurs */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Utilisateurs</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {userStats.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              {calculateGrowth(userStats.monthCount, userStats.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {userStats.monthCount} nouveaux ce mois-ci{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {userStats.todayCount} nouveaux aujourd'hui
          </div>
        </CardFooter>
      </Card>

      {/* Provinces */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Provinces</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {provinceStats.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              {calculateGrowth(provinceStats.monthCount, provinceStats.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {provinceStats.monthCount} nouvelles ce mois-ci{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {provinceStats.todayCount} ajoutées aujourd'hui
          </div>
        </CardFooter>
      </Card>

      {/* Sections */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sections</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {sectionStats.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              {calculateGrowth(sectionStats.monthCount, sectionStats.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {sectionStats.monthCount} nouvelles ce mois-ci{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {sectionStats.todayCount} créées aujourd'hui
          </div>
        </CardFooter>
      </Card>

      {/* Abonnements */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <IconCreditCard className="size-4" /> Revenus (USD)
          </CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums">
            ${subStats.totalRevenueUSD.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="text-xs">
              {subStats.activePremiumCount} Premium
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {subStats.monthCount} nouveaux abonnements{" "}
            <IconTrendingUp className="size-4 text-green-500" />
          </div>
          <div className="text-muted-foreground">
            {subStats.todayCount} ventes aujourd'hui
          </div>
        </CardFooter>
      </Card>

      {/* Cours */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Cours</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {courseStats.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="gap-1">
              <IconTrendingUp className="size-3" />
              {calculateGrowth(courseStats.newThisMonth, courseStats.total)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {courseStats.newThisMonth} nouveaux ce mois-ci{" "}
            <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {courseStats.todayCount} cours ajoutés aujourd'hui
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
