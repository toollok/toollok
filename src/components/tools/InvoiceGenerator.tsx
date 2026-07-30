"use client";

import { useState, useMemo } from "react";
import { FileText, Plus, Trash2, Printer, Building2, User, Save, Check } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import AdSlot from "@/components/ui/AdSlot";

interface LineItem {
     id: string;
     description: string;
     quantity: number;
     unitPrice: number;
}

interface SavedClient {
     id: string;
     name: string;
     email: string;
     address: string;
}

interface InvoiceState {
     invoiceNumber: string;
     issueDate: string;
     dueDate: string;
     currency: string;
     taxRate: number;
     discount: number;
     senderName: string;
     senderEmail: string;
     senderAddress: string;
     clientName: string;
     clientEmail: string;
     clientAddress: string;
     items: LineItem[];
}

export default function InvoiceGenerator() {
     const [invoice, setInvoice] = useLocalStorage<InvoiceState>("toollok_invoice_draft", {
          invoiceNumber: "INV-2026-001",
          issueDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          currency: "$",
          taxRate: 10,
          discount: 0,
          senderName: "Acme Web Studio",
          senderEmail: "billing@acmeweb.com",
          senderAddress: "123 Tech Avenue, Silicon Valley, CA",
          clientName: "Global Tech Corp",
          clientEmail: "accounts@globaltech.com",
          clientAddress: "456 Enterprise Blvd, New York, NY",
          items: [
               { id: "1", description: "Full-Stack Web App Development", quantity: 1, unitPrice: 3500 },
               { id: "2", description: "UI/UX Design & Wireframing", quantity: 20, unitPrice: 75 }
          ]
     });

     const [savedClients, setSavedClients] = useLocalStorage<SavedClient[]>("toollok_saved_clients", [
          { id: "1", name: "Global Tech Corp", email: "accounts@globaltech.com", address: "456 Enterprise Blvd, New York, NY" }
     ]);

     const [clientSavedMsg, setClientSavedMsg] = useState(false);

     const addItem = () => {
          setInvoice({
               ...invoice,
               items: [...invoice.items, { id: Math.random().toString(), description: "New Service Item", quantity: 1, unitPrice: 100 }]
          });
     };

     const removeItem = (id: string) => {
          if (invoice.items.length <= 1) return;
          setInvoice({
               ...invoice,
               items: invoice.items.filter(item => item.id !== id)
          });
     };

     const updateItem = (id: string, field: keyof LineItem, value: any) => {
          setInvoice({
               ...invoice,
               items: invoice.items.map(item => item.id === id ? { ...item, [field]: value } : item)
          });
     };

     const saveCurrentClient = () => {
          if (!invoice.clientName) return;
          const newClient: SavedClient = {
               id: Math.random().toString(),
               name: invoice.clientName,
               email: invoice.clientEmail,
               address: invoice.clientAddress
          };
          setSavedClients([...savedClients, newClient]);
          setClientSavedMsg(true);
          setTimeout(() => setClientSavedMsg(false), 2000);
     };

     const selectClient = (clientId: string) => {
          const found = savedClients.find(c => c.id === clientId);
          if (found) {
               setInvoice({
                    ...invoice,
                    clientName: found.name,
                    clientEmail: found.email,
                    clientAddress: found.address
               });
          }
     };

     // Calculations
     const calculations = useMemo(() => {
          const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
          const discountAmount = (subtotal * invoice.discount) / 100;
          const taxableAmount = Math.max(0, subtotal - discountAmount);
          const taxAmount = (taxableAmount * invoice.taxRate) / 100;
          const total = taxableAmount + taxAmount;

          return { subtotal, discountAmount, taxAmount, total };
     }, [invoice]);

     const handlePrint = () => {
          window.print();
     };

     useKeyboardShortcuts([
          { key: "p", ctrlOrCmd: true, action: handlePrint }
     ]);

     return (
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">

               {/* Strict Single-Page Print CSS Rules */}
               <style jsx global>{`
                    @media print {
                         @page {
                              size: A4 portrait;
                              margin: 8mm;
                         }
                         body * {
                              visibility: hidden;
                         }
                         #printable-invoice, #printable-invoice * {
                              visibility: visible;
                         }
                         #printable-invoice {
                              position: absolute;
                              left: 0;
                              top: 0;
                              width: 100% !important;
                              max-height: 100vh !important;
                              margin: 0 !important;
                              padding: 12px !important;
                              background: white !important;
                              color: black !important;
                              box-shadow: none !important;
                              border: none !important;
                              font-size: 11px !important;
                         }
                         #printable-invoice h1 {
                              font-size: 22px !important;
                              margin-bottom: 2px !important;
                         }
                         #printable-invoice .print-compact-pb {
                              padding-bottom: 10px !important;
                         }
                         #printable-invoice .print-compact-gap {
                              gap: 10px !important;
                         }
                         #printable-invoice th, #printable-invoice td {
                              padding-top: 5px !important;
                              padding-bottom: 5px !important;
                         }
                    }
               `}</style>

               {/* Header Section (Hidden on Print) */}
               <div className="flex items-center justify-between mb-2 print:hidden">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20">
                              <FileText size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Professional PDF Invoice & Estimate Generator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Create, customize, and export professional watermark-free invoices instantly.</p>
                         </div>
                    </div>

                    <div className="flex items-center gap-3">
                         <button
                              onClick={handlePrint}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-blue-600/25"
                              title="Shortcut: Ctrl+P"
                         >
                              <Printer size={16} /> Print / Download PDF
                         </button>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-invoice-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2 print:hidden" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Column: Form Editor (Hidden on Print) */}
                    <div className="lg:col-span-5 flex flex-col gap-6 print:hidden">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-5">
                              <h3 className="text-white font-bold text-base border-b border-gray-800/60 pb-3 flex items-center gap-2">
                                   <Building2 size={16} className="text-blue-400" /> Invoice Settings & Details
                              </h3>

                              <div className="grid grid-cols-2 gap-3">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Invoice Number</label>
                                        <input
                                             type="text"
                                             value={invoice.invoiceNumber}
                                             onChange={(e) => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-blue-500"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Currency</label>
                                        <select
                                             value={invoice.currency}
                                             onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                                        >
                                             <option value="$">USD ($)</option>
                                             <option value="€">EUR (€)</option>
                                             <option value="£">GBP (£)</option>
                                             <option value="₹">INR (₹)</option>
                                        </select>
                                   </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Issue Date</label>
                                        <input
                                             type="date"
                                             value={invoice.issueDate}
                                             onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Due Date</label>
                                        <input
                                             type="date"
                                             value={invoice.dueDate}
                                             onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                                        />
                                   </div>
                              </div>

                              {/* Sender & Client */}
                              <div className="grid grid-cols-1 gap-4 pt-2 border-t border-gray-800">
                                   <div className="flex flex-col gap-2">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Sender (From)</span>
                                        <input
                                             type="text"
                                             value={invoice.senderName}
                                             onChange={(e) => setInvoice({ ...invoice, senderName: e.target.value })}
                                             placeholder="Company Name"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                        />
                                        <input
                                             type="text"
                                             value={invoice.senderEmail}
                                             onChange={(e) => setInvoice({ ...invoice, senderEmail: e.target.value })}
                                             placeholder="Email"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                        />
                                   </div>

                                   <div className="flex flex-col gap-2 pt-2 border-t border-gray-800/60">
                                        <div className="flex items-center justify-between">
                                             <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Client (To)</span>
                                             {savedClients.length > 0 && (
                                                  <select
                                                       onChange={(e) => selectClient(e.target.value)}
                                                       defaultValue=""
                                                       className="bg-gray-950 border border-gray-700 rounded-lg px-2 py-1 text-[10px] text-gray-300 outline-none"
                                                  >
                                                       <option value="" disabled>Load Saved Client...</option>
                                                       {savedClients.map(c => (
                                                            <option key={c.id} value={c.id}>{c.name}</option>
                                                       ))}
                                                  </select>
                                             )}
                                        </div>
                                        <input
                                             type="text"
                                             value={invoice.clientName}
                                             onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                                             placeholder="Client Name"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                        />
                                        <input
                                             type="text"
                                             value={invoice.clientEmail}
                                             onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                                             placeholder="Client Email"
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                                        />
                                        <textarea
                                             value={invoice.clientAddress}
                                             onChange={(e) => setInvoice({ ...invoice, clientAddress: e.target.value })}
                                             placeholder="Client Address"
                                             rows={2}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                                        />
                                        <div className="flex items-center justify-between pt-1">
                                             <button
                                                  onClick={saveCurrentClient}
                                                  className="flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                                             >
                                                  {clientSavedMsg ? <Check size={12} /> : <Save size={12} />}
                                                  {clientSavedMsg ? "Client Saved!" : "Save to Address Book"}
                                             </button>
                                        </div>
                                   </div>
                              </div>

                              {/* Tax & Discount */}
                              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Tax Rate (%)</label>
                                        <input
                                             type="number"
                                             value={invoice.taxRate}
                                             onChange={(e) => setInvoice({ ...invoice, taxRate: Number(e.target.value) || 0 })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                                        />
                                   </div>
                                   <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Discount (%)</label>
                                        <input
                                             type="number"
                                             value={invoice.discount}
                                             onChange={(e) => setInvoice({ ...invoice, discount: Number(e.target.value) || 0 })}
                                             className="w-full bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                                        />
                                   </div>
                              </div>
                         </div>
                    </div>

                    {/* Right Column: Printable Single-Page Invoice Preview Card */}
                    <div className="lg:col-span-7 flex flex-col gap-6 w-full">
                         <div
                              id="printable-invoice"
                              className="bg-white text-gray-900 rounded-3xl p-8 md:p-10 shadow-2xl border border-gray-200 flex flex-col gap-6"
                         >

                              {/* Invoice Header */}
                              <div className="flex justify-between items-start border-b border-gray-200 pb-5 print-compact-pb">
                                   <div>
                                        <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">INVOICE</h1>
                                        <p className="text-sm font-mono text-gray-500">{invoice.invoiceNumber}</p>
                                   </div>
                                   <div className="text-right">
                                        <h2 className="font-bold text-base text-gray-900">{invoice.senderName}</h2>
                                        <p className="text-xs text-gray-600">{invoice.senderEmail}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 max-w-[200px]">{invoice.senderAddress}</p>
                                   </div>
                              </div>

                              {/* Dates & Bill To */}
                              <div className="grid grid-cols-2 gap-6 print-compact-gap">
                                   <div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Billed To:</span>
                                        <h3 className="font-bold text-gray-900 text-sm">{invoice.clientName}</h3>
                                        <p className="text-xs text-gray-600">{invoice.clientEmail}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 whitespace-pre-line">{invoice.clientAddress}</p>
                                   </div>
                                   <div className="text-right flex flex-col justify-start">
                                        <div className="mb-1.5">
                                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Issue Date</span>
                                             <span className="text-xs font-mono font-medium text-gray-800">{invoice.issueDate}</span>
                                        </div>
                                        <div>
                                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Due Date</span>
                                             <span className="text-xs font-mono font-medium text-gray-800">{invoice.dueDate}</span>
                                        </div>
                                   </div>
                              </div>

                              {/* Line Items Table & Editor */}
                              <div className="flex flex-col gap-3">
                                   <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                             <thead>
                                                  <tr className="border-b border-gray-200 text-gray-500 uppercase font-mono text-[10px]">
                                                       <th className="pb-2">Description</th>
                                                       <th className="pb-2 text-right">Qty</th>
                                                       <th className="pb-2 text-right">Unit Price</th>
                                                       <th className="pb-2 text-right">Amount</th>
                                                       <th className="pb-2 text-center print:hidden">Action</th>
                                                  </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-100">
                                                  {invoice.items.map((item) => (
                                                       <tr key={item.id} className="group">
                                                            <td className="py-2.5 pr-4">
                                                                 <input
                                                                      type="text"
                                                                      value={item.description}
                                                                      onChange={(e) => updateItem(item.id, "description", e.target.value)}
                                                                      className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-gray-900 font-medium py-0.5"
                                                                 />
                                                            </td>
                                                            <td className="py-2.5 text-right font-mono">
                                                                 <input
                                                                      type="number"
                                                                      value={item.quantity}
                                                                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 0)}
                                                                      className="w-14 text-right bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none print:border-none print:bg-transparent"
                                                                 />
                                                            </td>
                                                            <td className="py-2.5 text-right font-mono">
                                                                 <input
                                                                      type="number"
                                                                      value={item.unitPrice}
                                                                      onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value) || 0)}
                                                                      className="w-20 text-right bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 outline-none print:border-none print:bg-transparent"
                                                                 />
                                                            </td>
                                                            <td className="py-2.5 text-right font-mono font-bold text-gray-900">
                                                                 {invoice.currency}{(item.quantity * item.unitPrice).toLocaleString()}
                                                            </td>
                                                            <td className="py-2.5 text-center print:hidden">
                                                                 <button
                                                                      onClick={() => removeItem(item.id)}
                                                                      className="text-gray-400 hover:text-rose-500 transition-colors"
                                                                 >
                                                                      <Trash2 size={14} />
                                                                 </button>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   <button
                                        onClick={addItem}
                                        className="print:hidden w-full flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 rounded-xl transition-all text-xs border border-gray-200"
                                   >
                                        <Plus size={14} /> Add Line Item
                                   </button>
                              </div>

                              {/* Totals Summary */}
                              <div className="flex justify-end pt-3 border-t border-gray-200">
                                   <div className="w-full max-w-xs flex flex-col gap-1.5 font-mono text-xs">
                                        <div className="flex justify-between text-gray-600">
                                             <span>Subtotal</span>
                                             <span>{invoice.currency}{calculations.subtotal.toLocaleString()}</span>
                                        </div>
                                        {invoice.discount > 0 && (
                                             <div className="flex justify-between text-emerald-600">
                                                  <span>Discount ({invoice.discount}%)</span>
                                                  <span>-{invoice.currency}{calculations.discountAmount.toLocaleString()}</span>
                                             </div>
                                        )}
                                        {invoice.taxRate > 0 && (
                                             <div className="flex justify-between text-gray-600">
                                                  <span>Tax ({invoice.taxRate}%)</span>
                                                  <span>+{invoice.currency}{calculations.taxAmount.toLocaleString()}</span>
                                             </div>
                                        )}
                                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200 font-sans">
                                             <span>Total Due</span>
                                             <span className="font-mono">{invoice.currency}{calculations.total.toLocaleString()}</span>
                                        </div>
                                   </div>
                              </div>

                         </div>
                    </div>
               </div>

               {/* Bottom In-Feed Ad Banner */}
               <AdSlot adSlot="bottom-invoice-ad" format="fluid" className="mt-4 print:hidden" />

          </div>
     );
}