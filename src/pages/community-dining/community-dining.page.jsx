import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import WrapperComponent from "../../components/wrapper/wrapper.component";
import ScrollToTop from "../../components/common/scroll-to-top.component";
import FeatureCard from "../../components/card/featured-card/featured-card.component";
import StepsGridCard from "../../components/card/steps-grid-card/steps-grid-card.component";
import BaseBtn from "../../components/button/base-button.component";

import { useOpenTableStore } from "../../store/useOpenTableStore";
import { useAuthStore } from "../../store/useAuthStore";
import OpenTableCard from "../../features/dining-journey/open-table/open-table-card/open-table-card.component";
import JoinTableModal from "../../features/dining-journey/open-table/join-table-modal/join-table-modal.component";

const CommunityDiningPage = () => {
  const navigate = useNavigate();

  const fetchOpenTables = useOpenTableStore((state) => state.fetchOpenTables);
  const openTables = useOpenTableStore((state) => state.openTables);
  const isLoading = useOpenTableStore((state) => state.isLoading);
  const fetchError = useOpenTableStore((state) => state.fetchError);

  const { user, authReady } = useAuthStore();

  const [selectedTable, setSelectedTable] = useState(null);
  const [search, setSearch] = useState("");
  const [filterApproval, setFilterApproval] = useState("all"); // "all" | "approval" | "public"

  useEffect(() => {
    if (authReady) {
      fetchOpenTables();
    }
  }, [authReady, fetchOpenTables]);

  const filteredTables = useMemo(() => {
    let result = [...openTables];

    // Filter by approval type
    if (filterApproval !== "all") {
      result = result.filter(
        (table) =>
          (filterApproval === "approval" &&
            table.tableVisibility === "open_approval") ||
          (filterApproval === "public" &&
            table.tableVisibility === "open_public"),
      );
    }

    // Search by restaurant name or address
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (table) =>
          table.location?.name?.toLowerCase().includes(query) ||
          table.location?.address?.toLowerCase().includes(query),
      );
    }

    // Sort by nearest date
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  }, [openTables, filterApproval, search]);

  const handleCreateTable = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/restaurants");
  };

  return (
    <WrapperComponent>
      <ScrollToTop />

      <FeatureCard
        eyebrow="community dining"
        title="MEET & DINE. Share a table, Meet new people."
        subtitle="Discover open reservations hosted by fellow diners. Join a table, enjoy great food, and turn every meal into a shared experience."
      />

      <FeatureCard eyebrow="How it works" />

      <StepsGridCard
        steps={[
          {
            title: "Find a Community Dining Event",
            description:
              "Browse open reservations hosted by fellow diners and join a table for a shared dining experience.",
          },
          {
            title: "Join the Table",
            description:
              "Send a request to the host or join directly, depending on table settings, and enjoy a meal together.",
          },
          {
            title: "Enjoy the Experience",
            description:
              "Meet fellow diners, enjoy great food, and create memorable moments together.",
          },
        ]}
      />

      {/* Main Content */}
      <div className="mt-12">
        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurants or locations"
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 bg-white outline-none focus:border-black transition"
            />
          </div>

          {/* Filter by approval type */}
          <div className="flex gap-2">
            {[
              { id: "all", label: "All Tables" },
              { id: "approval", label: "Needs Approval" },
              { id: "public", label: "Join Freely" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setFilterApproval(option.id)}
                className={`px-4 h-12 rounded-xl text-sm font-medium transition ${
                  filterApproval === option.id
                    ? "bg-black text-white"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-20 text-center">
            <p className="text-gray-500">Discovering open tables...</p>
          </div>
        )}

        {/* Error */}
        {fetchError && (
          <div className="py-16 text-center border border-gray-200 rounded-2xl">
            <h2 className="font-semibold text-lg">Something went wrong</h2>
            <p className="text-gray-500 mt-1">{fetchError}</p>
            <button
              onClick={fetchOpenTables}
              className="mt-5 px-5 py-2.5 rounded-lg bg-black text-white text-sm font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Tables List */}
        {!isLoading && !fetchError && (
          <>
            {filteredTables.length > 0 ? (
              <div className="space-y-5 mb-12">
                {filteredTables.map((table) => (
                  <OpenTableCard
                    key={table.id}
                    table={table}
                    onJoinClick={() => setSelectedTable(table)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state with CTA */
              <div className="text-center py-20 border border-gray-200 rounded-2xl">
                <div className="text-4xl mb-4">🍽️</div>
                <h2 className="text-xl font-semibold">
                  {search ? "No tables found" : "No open tables yet"}
                </h2>

                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  {search
                    ? "Try searching for a different restaurant or location."
                    : "There are no open tables available right now. Be the first to create one!"}
                </p>

                <button
                  onClick={handleCreateTable}
                  className="mt-6 px-6 py-3 rounded-lg bg-black text-white font-medium hover:opacity-90 transition"
                >
                  Create an Open Table
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA Section */}
        {filteredTables.length > 0 && (
          <div className="mt-12 mb-6 px-8 py-6 border-2 border-gray-300 rounded-2xl bg-gray-50">
            <FeatureCard
              eyebrow="host a table"
              title="Ready to share a meal with the community?"
              subtitle="Create your own open table, choose how many seats to share and who can join. Set it to private (needs approval) or public (join freely), and let other diners discover your experience."
            />
          </div>
        )}

        {/* Create table button */}
        {filteredTables.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold uppercase mb-2">Want to host?</h3>
            <p className="text-base text-gray-600 mb-4">
              Create your own open table and invite fellow diners to join you
              for a shared meal.
            </p>
            <BaseBtn onClick={handleCreateTable}>Create an Open Table</BaseBtn>
          </div>
        )}
      </div>

      {/* Join Table Modal */}
      <JoinTableModal
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </WrapperComponent>
  );
};

export default CommunityDiningPage;
