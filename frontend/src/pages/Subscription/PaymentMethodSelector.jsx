import React from "react";
import { FiCreditCard, FiSmartphone } from "react-icons/fi";

const PaymentMethodSelector = ({ selectedMethod, onChange }) => {
  const paymentMethods = [
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: <FiCreditCard className="h-5 w-5" />,
      description: "Pay securely with your credit or debit card",
    },
    {
      id: "upi",
      name: "UPI Payment",
      icon: <FiSmartphone className="h-5 w-5" />,
      description: "Pay using UPI apps like Google Pay, PhonePe, etc.",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Select Payment Method
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedMethod === method.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => onChange(method.id)}
          >
            <div className="flex items-center">
              <div
                className={`flex-shrink-0 mr-3 p-2 rounded-full ${
                  selectedMethod === method.id
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {method.icon}
              </div>
              <div>
                <div className="font-medium">{method.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {method.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
