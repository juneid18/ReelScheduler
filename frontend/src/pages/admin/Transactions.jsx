import React, { useEffect, useState } from "react";
import { adminService } from "../../services/adminService";
import { format } from "date-fns";
import {
  RiArrowDownDoubleLine,
  RiArrowUpDoubleLine,
  RiCheckDoubleLine,
  RiSearch2Line,
} from "react-icons/ri";

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "created",
    direction: "desc",
  });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.getTransactions();
        setTransactions(res.data.transactions || []);
      } catch (err) {
        setError("Failed to load transactions");
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (tx) =>
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.customer?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      tx.receipt_email?.toLowerCase()?.includes(searchTerm.toLowerCase())
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      succeeded: { class: "bg-green-100 text-green-800", icon: "✓" },
      pending: { class: "bg-yellow-100 text-yellow-800", icon: "⏱" },
      failed: { class: "bg-red-100 text-red-800", icon: "✗" },
      refunded: { class: "bg-blue-100 text-blue-800", icon: "↩" },
    };
    return (
      statusMap[status] || { class: "bg-gray-100 text-gray-800", icon: "?" }
    );
  };

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Transaction History
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {transactions.length} total transactions
          </p>
        </div>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <RiSearch2Line className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by ID, customer, email, or description..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No transactions found
            </h3>
            <p className="mt-1 text-gray-500">
              {searchTerm
                ? "Try a different search term"
                : "No transactions available yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("id")}
                  >
                    <div className="flex items-center">
                      ID
                      {sortConfig.key === "id" &&
                        (sortConfig.direction === "asc" ? (
                          <RiArrowUpDoubleLine className="ml-1 h-4 w-4" />
                        ) : (
                          <RiArrowDownDoubleLine className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("amount")}
                  >
                    <div className="flex items-center">
                      Amount
                      {sortConfig.key === "amount" &&
                        (sortConfig.direction === "asc" ? (
                          <RiArrowUpDoubleLine className="ml-1 h-4 w-4" />
                        ) : (
                          <RiArrowDownDoubleLine className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === "status" &&
                        (sortConfig.direction === "asc" ? (
                          <RiArrowUpDoubleLine className="ml-1 h-4 w-4" />
                        ) : (
                          <RiArrowDownDoubleLine className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort("created")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === "created" &&
                        (sortConfig.direction === "asc" ? (
                          <RiArrowUpDoubleLine className="ml-1 h-4 w-4" />
                        ) : (
                          <RiArrowDownDoubleLine className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Customer
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTransactions.map((tx) => (
                  <React.Fragment key={tx.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRowExpand(tx.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-100">
                            <span className="text-gray-500 text-sm font-medium">
                              {getStatusBadge(tx.status).icon}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {tx.id.substring(0, 8)}...
                              {tx.id.substring(tx.id.length - 4)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {tx.payment_method}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(tx.amount, tx.currency)}
                        </div>
                        {tx.metadata?.order_id && (
                          <div className="text-xs text-gray-500">
                            Order: {tx.metadata.order_id}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusBadge(tx.status).class
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(tx.created * 1000), "MMM d, yyyy")}
                        <div className="text-xs text-gray-400">
                          {format(new Date(tx.created * 1000), "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {tx.customer || "Unknown"}
                        </div>
                        {tx.receipt_email ||
                          (tx.customer?.email && (
                            <div className="text-sm text-gray-500">
                              {tx.receipt_email ||
                                tx.customer?.email ||
                                "No email"}
                            </div>
                          ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add view details action
                          }}
                        >
                          View
                        </button>
                        <RiCheckDoubleLine
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            expandedRow === tx.id ? "rotate-180" : ""
                          }`}
                        />
                      </td>
                    </tr>
                    {expandedRow === tx.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Transaction Details
                              </h4>
                              <div className="text-sm text-gray-500 space-y-1">
                                <p>
                                  <span className="font-medium">
                                    Description:
                                  </span>{" "}
                                  {tx.description || "None"}
                                </p>
                                <p>
                                  <span className="font-medium">
                                    Payment Method:
                                  </span>{" "}
                                  {tx.payment_method}
                                </p>
                                {tx.metadata &&
                                  Object.entries(tx.metadata).map(
                                    ([key, value]) => (
                                      <p key={key}>
                                        <span className="font-medium">
                                          {key}:
                                        </span>{" "}
                                        {value}
                                      </p>
                                    )
                                  )}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Customer Information
                              </h4>
                              <div className="text-sm text-gray-500 space-y-1">
                                <p>
                                  <span className="font-medium">Name:</span>{" "}
                                  {tx.customer?.name || "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium">Email:</span>{" "}
                                  {tx.receipt_email ||
                                    tx.customer?.email ||
                                    "None"}
                                </p>
                                {tx.customer?.address && (
                                  <>
                                    <p>
                                      <span className="font-medium">
                                        Address:
                                      </span>{" "}
                                      {tx.customer.address.line1}
                                    </p>
                                    {tx.customer.address.line2 && (
                                      <p>{tx.customer.address.line2}</p>
                                    )}
                                    <p>
                                      {tx.customer.address.city},{" "}
                                      {tx.customer.address.state}{" "}
                                      {tx.customer.address.postal_code}
                                    </p>
                                    <p>{tx.customer.address.country}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
