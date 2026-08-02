"use client";

import { useState, useMemo } from "react";
import {
     Code, Copy, Check, ExternalLink, Sparkles, Building2,
     ShoppingBag, HelpCircle, FileText, CheckCircle2, Trash2,
     Plus, AlertTriangle, Globe, Minimize2, Maximize2
} from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type SchemaType = "article" | "product" | "faq" | "organization" | "localBusiness";

interface FAQItem {
     question: string;
     answer: string;
}

export default function SchemaMarkupGenerator() {
     const [schemaType, setSchemaType] = useState<SchemaType>("article");
     const [isCopied, setIsCopied] = useState(false);
     const [isMinified, setIsMinified] = useState(false);

     // Article State
     const [article, setArticle] = useState({
          headline: "10 Essential Developer Tools for 2026",
          image: "https://example.com/images/hero.jpg",
          authorName: "Sharma Subham",
          publisherName: "ToolLok",
          publisherLogo: "https://example.com/logo.png",
          datePublished: new Date().toISOString().split("T")[0],
          description: "Discover the top client-side developer utilities designed to boost your daily workflow."
     });

     // Product State
     const [product, setProduct] = useState({
          name: "Ergonomic Mechanical Keyboard",
          image: "https://example.com/keyboard.jpg",
          description: "Custom mechanical keyboard with hot-swappable switches and RGB backlighting.",
          brand: "TechGear",
          sku: "KB-2026-X",
          price: "149.99",
          currency: "USD",
          availability: "InStock"
     });

     // FAQ State
     const [faqs, setFaqs] = useState<FAQItem[]>([
          { question: "Is this JSON-LD schema generator completely free?", answer: "Yes, 100% of our SEO tools run locally in your browser with no subscription fees." },
          { question: "How do I add JSON-LD to my website?", answer: "Copy the generated snippet and paste it inside a <script type='application/ld+json'> tag in your HTML <head> section." }
     ]);

     // Organization State
     const [organization, setOrganization] = useState({
          name: "ToolLok Web Studios",
          url: "https://toollok.com",
          logo: "https://toollok.com/logo.png",
          sameAs: "https://twitter.com/toollok, https://github.com/toollok",
          contactPhone: "+1-800-555-0199"
     });

     // Local Business State
     const [localBiz, setLocalBiz] = useState({
          name: "Apex Tech Repairs",
          image: "https://example.com/storefront.jpg",
          telephone: "+1-555-0147",
          streetAddress: "123 Innovation Way",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
          priceRange: "$$"
     });

     // Helper to strip empty values
     const cleanObject = (obj: any): any => {
          return Object.fromEntries(
               Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
          );
     };

     // 1. Live Google Rich Results Validation Engine
     const validationWarnings = useMemo(() => {
          const warnings: string[] = [];
          if (schemaType === "article") {
               if (!article.headline) warnings.push("Headline is required.");
               if (!article.image) warnings.push("Image URL is required for Article Rich Results.");
               if (!article.authorName) warnings.push("Author Name is highly recommended.");
          } else if (schemaType === "product") {
               if (!product.name) warnings.push("Product Name is required.");
               if (!product.price) warnings.push("Price is required for Product Rich Results.");
               if (!product.image) warnings.push("Image URL is required.");
          } else if (schemaType === "faq") {
               const validFaqs = faqs.filter(f => f.question.trim() && f.answer.trim());
               if (validFaqs.length === 0) warnings.push("At least one valid Question/Answer pair is required.");
          } else if (schemaType === "organization") {
               if (!organization.name) warnings.push("Organization Name is required.");
               if (!organization.logo) warnings.push("Logo URL is required for Organization Rich Results.");
          } else if (schemaType === "localBusiness") {
               if (!localBiz.name) warnings.push("Business Name is required.");
               if (!localBiz.image) warnings.push("Image URL is required.");
               if (!localBiz.streetAddress || !localBiz.city) warnings.push("Complete Address is required for Local Business Rich Results.");
          }
          return warnings;
     }, [schemaType, article, product, faqs, organization, localBiz]);

     // Generate Structured JSON-LD Data Object
     const schemaObject = useMemo(() => {
          let schemaObj: any = { "@context": "https://schema.org" };

          if (schemaType === "article") {
               schemaObj = {
                    ...schemaObj,
                    "@type": "Article",
                    "headline": article.headline,
                    "image": article.image ? [article.image] : undefined,
                    "datePublished": article.datePublished,
                    "author": article.authorName ? { "@type": "Person", "name": article.authorName } : undefined,
                    "publisher": article.publisherName ? {
                         "@type": "Organization",
                         "name": article.publisherName,
                         "logo": article.publisherLogo ? { "@type": "ImageObject", "url": article.publisherLogo } : undefined
                    } : undefined,
                    "description": article.description
               };
          } else if (schemaType === "product") {
               schemaObj = {
                    ...schemaObj,
                    "@type": "Product",
                    "name": product.name,
                    "image": product.image ? [product.image] : undefined,
                    "description": product.description,
                    "sku": product.sku,
                    "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined,
                    "offers": product.price ? {
                         "@type": "Offer",
                         "priceCurrency": product.currency,
                         "price": product.price,
                         "availability": `https://schema.org/${product.availability}`
                    } : undefined
               };
          } else if (schemaType === "faq") {
               schemaObj = {
                    ...schemaObj,
                    "@type": "FAQPage",
                    "mainEntity": faqs.filter(f => f.question.trim()).map(f => ({
                         "@type": "Question",
                         "name": f.question,
                         "acceptedAnswer": {
                              "@type": "Answer",
                              "text": f.answer
                         }
                    }))
               };
          } else if (schemaType === "organization") {
               const socialLinks = organization.sameAs.split(",").map(s => s.trim()).filter(Boolean);
               schemaObj = {
                    ...schemaObj,
                    "@type": "Organization",
                    "name": organization.name,
                    "url": organization.url,
                    "logo": organization.logo,
                    "sameAs": socialLinks.length > 0 ? socialLinks : undefined,
                    "contactPoint": organization.contactPhone ? {
                         "@type": "ContactPoint",
                         "telephone": organization.contactPhone,
                         "contactType": "customer service"
                    } : undefined
               };
          } else if (schemaType === "localBusiness") {
               schemaObj = {
                    ...schemaObj,
                    "@type": "LocalBusiness",
                    "name": localBiz.name,
                    "image": localBiz.image,
                    "telephone": localBiz.telephone,
                    "priceRange": localBiz.priceRange,
                    "address": {
                         "@type": "PostalAddress",
                         "streetAddress": localBiz.streetAddress,
                         "addressLocality": localBiz.city,
                         "addressRegion": localBiz.state,
                         "postalCode": localBiz.postalCode,
                         "addressCountry": localBiz.country
                    }
               };
          }

          return cleanObject(schemaObj);
     }, [schemaType, article, product, faqs, organization, localBiz]);

     // Handle Stringification based on Minify state
     const jsonLdString = isMinified ? JSON.stringify(schemaObject) : JSON.stringify(schemaObject, null, 2);
     const rawCopyCode = `<script type="application/ld+json">\n${jsonLdString}\n</script>`;

     // 3. JSON Syntax Highlighter Engine
     const highlightedJson = useMemo(() => {
          let highlighted = jsonLdString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          // Regex matches Strings, Keys, Booleans, Nulls, and Numbers
          highlighted = highlighted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
               let cls = 'text-emerald-400'; // Default string color
               if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                         cls = 'text-cyan-400 font-bold'; // JSON Key color
                    }
               } else if (/true|false/.test(match)) {
                    cls = 'text-pink-400 font-bold'; // Boolean color
               } else if (/null/.test(match)) {
                    cls = 'text-gray-500 font-bold'; // Null color
               } else {
                    cls = 'text-amber-400'; // Number color
               }
               return `<span class="${cls}">${match}</span>`;
          });

          // Wrap in Script Tags manually to preserve syntax look
          const scriptStart = `<span class="text-gray-500">&lt;script type="application/ld+json"&gt;</span>\n`;
          const scriptEnd = `\n<span class="text-gray-500">&lt;/script&gt;</span>`;
          return scriptStart + highlighted + scriptEnd;
     }, [jsonLdString]);

     const copyJsonLd = () => {
          navigator.clipboard.writeText(rawCopyCode);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
     };

     const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
     const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
     const updateFaq = (index: number, field: "question" | "answer", val: string) => {
          const updated = [...faqs];
          updated[index][field] = val;
          setFaqs(updated);
     };

     return (
          <div className="w-full flex flex-col gap-6">

               {/* Header Section */}
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                              <Code size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-white">Schema Markup (JSON-LD) Generator</h2>
                                   <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-400">Generate validated structured data with real-time Google Rich Results validation and payload minification.</p>
                         </div>
                    </div>
               </div>

               {/* Top Ad Banner */}
               <AdSlot adSlot="top-schema-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* LEFT COLUMN: Schema Type Selector & Form Editor (Span 5) */}
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-xl">

                              {/* Schema Type Tabs */}
                              <div className="space-y-3">
                                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                                        Select Schema Type
                                   </label>
                                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <button
                                             onClick={() => setSchemaType("article")}
                                             className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "article" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <FileText size={16} /> Article
                                        </button>
                                        <button
                                             onClick={() => setSchemaType("product")}
                                             className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "product" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <ShoppingBag size={16} /> Product
                                        </button>
                                        <button
                                             onClick={() => setSchemaType("faq")}
                                             className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "faq" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <HelpCircle size={16} /> FAQ Page
                                        </button>
                                        <button
                                             onClick={() => setSchemaType("organization")}
                                             className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "organization" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <Building2 size={16} /> Business
                                        </button>
                                        <button
                                             onClick={() => setSchemaType("localBusiness")}
                                             className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all col-span-2 sm:col-span-2 ${schemaType === "localBusiness" ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300" : "bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700"
                                                  }`}
                                        >
                                             <Globe size={16} /> Local Business
                                        </button>
                                   </div>
                              </div>

                              {/* Dynamic Form Fields */}
                              <div className="space-y-4 pt-2 border-t border-gray-800/80">

                                   {/* ARTICLE FORM */}
                                   {schemaType === "article" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Headline / Article Title</label>
                                                  <input type="text" value={article.headline} onChange={(e) => setArticle({ ...article, headline: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Article Description</label>
                                                  <textarea value={article.description} onChange={(e) => setArticle({ ...article, description: e.target.value })} rows={2} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 outline-none focus:border-cyan-500/50 resize-none" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Author Name</label>
                                                       <input type="text" value={article.authorName} onChange={(e) => setArticle({ ...article, authorName: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Date Published</label>
                                                       <input type="date" value={article.datePublished} onChange={(e) => setArticle({ ...article, datePublished: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Publisher Name</label>
                                                       <input type="text" value={article.publisherName} onChange={(e) => setArticle({ ...article, publisherName: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Publisher Logo URL</label>
                                                       <input type="text" value={article.publisherLogo} onChange={(e) => setArticle({ ...article, publisherLogo: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                             </div>
                                        </>
                                   )}

                                   {/* PRODUCT FORM */}
                                   {schemaType === "product" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Product Name</label>
                                                  <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Description</label>
                                                  <textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={2} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-xs text-gray-200 outline-none focus:border-cyan-500/50 resize-none" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Brand Name</label>
                                                       <input type="text" value={product.brand} onChange={(e) => setProduct({ ...product, brand: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">SKU</label>
                                                       <input type="text" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Price</label>
                                                       <input type="text" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Currency</label>
                                                       <input type="text" value={product.currency} onChange={(e) => setProduct({ ...product, currency: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Availability</label>
                                                       <select value={product.availability} onChange={(e) => setProduct({ ...product, availability: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-2 py-2 text-xs text-gray-200 outline-none">
                                                            <option value="InStock">In Stock</option>
                                                            <option value="OutOfStock">Out of Stock</option>
                                                            <option value="PreOrder">Pre-Order</option>
                                                       </select>
                                                  </div>
                                             </div>
                                        </>
                                   )}

                                   {/* FAQ FORM */}
                                   {schemaType === "faq" && (
                                        <div className="space-y-3">
                                             {faqs.map((faq, index) => (
                                                  <div key={index} className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl space-y-2 relative group">
                                                       <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-cyan-400 uppercase">Question #{index + 1}</span>
                                                            {faqs.length > 1 && (
                                                                 <button onClick={() => removeFaq(index)} className="text-gray-600 hover:text-rose-400 transition-colors">
                                                                      <Trash2 size={14} />
                                                                 </button>
                                                            )}
                                                       </div>
                                                       <input type="text" placeholder="Question..." value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                                       <textarea placeholder="Answer..." value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} rows={2} className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-xs text-gray-200 outline-none focus:border-cyan-500/50 resize-none" />
                                                  </div>
                                             ))}
                                             <button onClick={addFaq} className="w-full py-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-xs font-bold text-gray-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors">
                                                  <Plus size={14} /> Add FAQ Item
                                             </button>
                                        </div>
                                   )}

                                   {/* ORGANIZATION FORM */}
                                   {schemaType === "organization" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Organization Name</label>
                                                  <input type="text" value={organization.name} onChange={(e) => setOrganization({ ...organization, name: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Official Website URL</label>
                                                  <input type="text" value={organization.url} onChange={(e) => setOrganization({ ...organization, url: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Logo URL</label>
                                                  <input type="text" value={organization.logo} onChange={(e) => setOrganization({ ...organization, logo: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Social Profiles (Comma-separated)</label>
                                                  <input type="text" value={organization.sameAs} onChange={(e) => setOrganization({ ...organization, sameAs: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                             </div>
                                        </>
                                   )}

                                   {/* LOCAL BUSINESS FORM */}
                                   {schemaType === "localBusiness" && (
                                        <>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Business Name</label>
                                                       <input type="text" value={localBiz.name} onChange={(e) => setLocalBiz({ ...localBiz, name: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Telephone</label>
                                                       <input type="text" value={localBiz.telephone} onChange={(e) => setLocalBiz({ ...localBiz, telephone: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50 font-mono" />
                                                  </div>
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Street Address</label>
                                                  <input type="text" value={localBiz.streetAddress} onChange={(e) => setLocalBiz({ ...localBiz, streetAddress: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-200 outline-none focus:border-cyan-500/50" />
                                             </div>
                                             <div className="grid grid-cols-3 gap-2">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">City</label>
                                                       <input type="text" value={localBiz.city} onChange={(e) => setLocalBiz({ ...localBiz, city: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">State</label>
                                                       <input type="text" value={localBiz.state} onChange={(e) => setLocalBiz({ ...localBiz, state: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Zip Code</label>
                                                       <input type="text" value={localBiz.postalCode} onChange={(e) => setLocalBiz({ ...localBiz, postalCode: e.target.value })} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none font-mono" />
                                                  </div>
                                             </div>
                                        </>
                                   )}

                              </div>
                         </div>
                    </div>

                    {/* RIGHT COLUMN: Output Code Box & Google Tester (Span 7) */}
                    <div className="lg:col-span-7 flex flex-col gap-6">

                         {/* Validation Warnings Banner */}
                         {validationWarnings.length > 0 && (
                              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex flex-col gap-2">
                                   <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
                                        <AlertTriangle size={16} /> Rich Results Validation Issues
                                   </div>
                                   <ul className="list-disc ml-5 space-y-1">
                                        {validationWarnings.map((w, i) => (
                                             <li key={i} className="text-[11px] text-amber-200/80">{w}</li>
                                        ))}
                                   </ul>
                              </div>
                         )}

                         <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-800/80 pb-3 gap-4">
                                   <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className={validationWarnings.length > 0 ? "text-amber-400" : "text-emerald-400"} />
                                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Generated JSON-LD Snippet</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                        {/* Minify Toggle */}
                                        <button
                                             onClick={() => setIsMinified(!isMinified)}
                                             className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 hover:text-white transition-colors bg-gray-950 px-2.5 py-1.5 rounded-lg border border-gray-800"
                                        >
                                             {isMinified ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                                             {isMinified ? "Expand" : "Minify Payload"}
                                        </button>
                                        <a
                                             href="https://search.google.com/test/rich-results"
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="text-[11px] font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-500/20 hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors"
                                        >
                                             Test Output <ExternalLink size={12} />
                                        </a>
                                   </div>
                              </div>

                              {/* Syntax Box with Live Highlighting */}
                              <div className="relative group">
                                   <pre
                                        className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5 text-xs font-mono leading-relaxed overflow-x-auto min-h-[300px] max-h-[480px] shadow-inner"
                                        dangerouslySetInnerHTML={{ __html: highlightedJson }}
                                   />
                              </div>

                              {/* Action Buttons */}
                              <button
                                   onClick={copyJsonLd}
                                   className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                              >
                                   {isCopied ? (
                                        <><Check size={18} className="text-white" /> Script Copied to Clipboard!</>
                                   ) : (
                                        <><Copy size={18} /> Copy JSON-LD Code Snippet</>
                                   )}
                              </button>

                         </div>
                    </div>

               </div>

               {/* Bottom Ad Banner */}
               <AdSlot adSlot="bottom-schema-ad" format="fluid" className="mt-4" />

          </div>
     );
}