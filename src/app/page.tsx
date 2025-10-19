"use client";

import { useEffect, useState } from "react";
import type { Advocate } from "@/types/advocate";

export default function Home() {
  const [advocates, setAdvocates] = useState<Advocate[]>([]);
  const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdvocates = async () => {
      try {
        console.log("fetching advocates...");
        setLoading(true);
        setError(null);

        const response = await fetch("/api/advocates?limit=5");

        if (!response.ok) {
          throw new Error(`Failed to fetch advocates: ${response.statusText}`);
        }

        const jsonResponse = await response.json();
        setAdvocates(jsonResponse.data);
        setFilteredAdvocates(jsonResponse.data);
      } catch (err) {
        console.error("Error fetching advocates:", err);
        setError(err instanceof Error ? err.message : "Failed to load advocates");
      } finally {
        setLoading(false);
      }
    };

    fetchAdvocates();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // Store original value for display

    // Use lowercase for filtering
    const lowerValue = value.toLowerCase();

    console.log("filtering advocates...");
    const filteredAdvocates = advocates.filter((advocate) => {
      return (
        advocate.firstName.toLowerCase().includes(lowerValue) ||
        advocate.lastName.toLowerCase().includes(lowerValue) ||
        advocate.city.toLowerCase().includes(lowerValue) ||
        advocate.degree.toLowerCase().includes(lowerValue) ||
        advocate.specialties.some((specialty) =>
          specialty.toLowerCase().includes(lowerValue)
        ) ||
        advocate.yearsOfExperience.toString().includes(lowerValue)
      );
    });

    setFilteredAdvocates(filteredAdvocates);
  };

  const onClick = () => {
    console.log(advocates);
    setSearchTerm(""); // Reset search term
    setFilteredAdvocates(advocates);
  };

  return (
    <main style={{ margin: "24px" }}>
      <h1>Solace Advocates</h1>
      <br />
      <br />
      <div>
        <p>Search</p>
        <p>
          Searching for: <span>{searchTerm}</span>
        </p>
        <input
          style={{ border: "1px solid black" }}
          onChange={onChange}
          value={searchTerm}
          disabled={loading}
        />
        <button onClick={onClick} disabled={loading}>Reset Search</button>
      </div>
      <br />
      <br />

      {/* Loading State */}
      {loading && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading advocates...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div style={{ padding: "20px", color: "red", border: "1px solid red", borderRadius: "4px" }}>
          <p><strong>Error:</strong> {error}</p>
          <p>Please try refreshing the page.</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredAdvocates.length === 0 && (
        <div style={{ padding: "20px", textAlign: "center", border: "1px solid #ccc", borderRadius: "4px" }}>
          <p>No advocates found matching your search criteria.</p>
          <p>Try adjusting your search or <button onClick={onClick}>reset the search</button>.</p>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && filteredAdvocates.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>City</th>
              <th>Degree</th>
              <th>Specialties</th>
              <th>Years of Experience</th>
              <th>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdvocates.map((advocate) => {
              return (
                <tr key={advocate.id}>
                  <td>{advocate.firstName}</td>
                  <td>{advocate.lastName}</td>
                  <td>{advocate.city}</td>
                  <td>{advocate.degree}</td>
                  <td>
                    {advocate.specialties.map((s, index) => (
                      <div key={index}>{s}</div>
                    ))}
                  </td>
                  <td>{advocate.yearsOfExperience}</td>
                  <td>{advocate.phoneNumber}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
  );
}
