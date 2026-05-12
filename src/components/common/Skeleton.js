import React from "react";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-custom border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/2 mt-3" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>

    <div className="mt-5 space-y-3">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-10/12" />
      <Skeleton className="h-4 w-8/12" />
    </div>

    <div className="mt-5 grid grid-cols-3 gap-3">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>

    <div className="mt-5 flex items-center justify-between">
      <Skeleton className="h-9 w-28 rounded-full" />
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  </div>
);

export const CardGridSkeleton = ({ cards = 6 }) => (
  <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-5">
    {Array.from({ length: cards }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

export const OpportunityListSkeleton = ({ cards = 4 }) => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md mt-3" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>
    </div>

    <div className="bg-white rounded-custom border border-gray-100 shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>

    <CardGridSkeleton cards={cards} />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="mb-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-full max-w-md mt-3" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-custom border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-11 w-11 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
      <div className="bg-white rounded-custom border border-gray-100 shadow-sm p-5">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-72 w-full mt-5" />
      </div>
      <div className="bg-white rounded-custom border border-gray-100 shadow-sm p-5">
        <Skeleton className="h-5 w-36" />
        <div className="mt-5 space-y-4">
          <CardSkeleton />
        </div>
      </div>
    </div>
  </div>
);

export const DetailSkeleton = () => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-full max-w-lg mt-3" />

    <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      <div className="bg-white rounded-custom border border-gray-100 p-6">
        <Skeleton className="h-56 w-full" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-9/12" />
        </div>
      </div>
      <div className="bg-white rounded-custom border border-gray-100 p-6">
        <Skeleton className="h-5 w-32" />
        <div className="mt-5 space-y-4">
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const PanelSkeleton = () => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-full max-w-lg mt-3" />

    <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 bg-white rounded-custom border border-gray-100 p-6">
        <Skeleton className="h-5 w-40" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <div className="bg-white rounded-custom border border-gray-100 p-6">
        <Skeleton className="h-5 w-36" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const ShipperGridSkeleton = ({ cards = 6 }) => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="mb-8">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-full max-w-lg mt-3" />
    </div>

    <div className="bg-white rounded-md border border-gray-200 p-4 md:p-6 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Skeleton className="h-12 flex-1" />
        <Skeleton className="h-12 w-36" />
      </div>
      <div className="hidden sm:grid sm:grid-cols-4 gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: cards }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3 w-24 mt-3" />
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-5 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export const ListPanelSkeleton = ({ rows = 5 }) => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-full max-w-lg mt-3" />

    <div className="mt-6 bg-white rounded-custom border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="border border-gray-100 rounded-lg p-4 flex items-center gap-4"
          >
            <Skeleton className="h-11 w-11 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-11/12 mt-3" />
            </div>
            <Skeleton className="h-8 w-24 rounded-full hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PaymentSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-3">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
    <Skeleton className="h-3 w-20" />
    <div className="space-y-2.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-gray-100 bg-white p-4 flex items-center gap-3"
        >
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28 mt-2" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
      <div className="bg-white rounded-custom border border-gray-100 p-4">
        <Skeleton className="h-10 w-full" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-custom border border-gray-100 p-5">
        <Skeleton className="h-12 w-full" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-7/12" />
          <Skeleton className="h-10 w-6/12 ml-auto" />
          <Skeleton className="h-10 w-8/12" />
          <Skeleton className="h-10 w-5/12 ml-auto" />
        </div>
        <Skeleton className="h-12 w-full mt-8" />
      </div>
    </div>
  </div>
);

export const ArticleSkeleton = () => (
  <div className="w-full min-h-[70vh] p-4 sm:p-6 font-montserrat">
    <div className="bg-white rounded-custom border border-gray-100 p-6 sm:p-8 max-w-5xl mx-auto">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-48 mt-3" />
      <div className="mt-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-6 w-52 mt-8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
        <Skeleton className="h-6 w-48 mt-8" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-8/12" />
      </div>
    </div>
  </div>
);

export const PageSkeleton = DashboardSkeleton;
