"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Code, Copy, Check, ExternalLink, Sparkles, Building2, ShoppingBag, HelpCircle, FileText, CheckCircle2, Trash2, Plus, AlertTriangle, Globe, Minimize2, Maximize2 } from "lucide-react";
import AdSlot from "@/components/ui/AdSlot";

type SchemaType = "article" | "product" | "faq" | "organization" | "localBusiness";
interface FAQItem { question: string; answer: string; }

export default function SchemaMarkupGenerator() {
     const [schemaType, setSchemaType] = useState<SchemaType>("article");
     const [isCopied, setIsCopied] = useState(false);
     const [isMinified, setIsMinified] = useState(false);

     const [article, setArticle] = useState({ headline: "10 Essential Developer Tools for 2026", image: "https://example.com/images/hero.jpg", authorName: "Sharma Subham", publisherName: "ToolLok", publisherLogo: "https://example.com/logo.png", datePublished: new Date().toISOString().split("T")[0], description: "Discover the top client-side developer utilities designed to boost your daily workflow." });
     const [product, setProduct] = useState({ name: "Ergonomic Mechanical Keyboard", image: "https://example.com/keyboard.jpg", description: "Custom mechanical keyboard with hot-swappable switches and RGB backlighting.", brand: "TechGear", sku: "KB-2026-X", price: "149.99", currency: "USD", availability: "InStock" });
     const [faqs, setFaqs] = useState<FAQItem[]>([{ question: "Is this JSON-LD schema generator completely free?", answer: "Yes, 100% of our SEO tools run locally in your browser with no subscription fees." }, { question: "How do I add JSON-LD to my website?", answer: "Copy the generated snippet and paste it inside a <script type='application/ld+json'> tag in your HTML <head> section." }]);
     const [organization, setOrganization] = useState({ name: "ToolLok Web Studios", url: "https://toollok.com", logo: "https://toollok.com/logo.png", sameAs: "https://twitter.com/toollok, https://github.com/toollok", contactPhone: "+1-800-555-0199" });
     const [localBiz, setLocalBiz] = useState({ name: "Apex Tech Repairs", image: "https://example.com/storefront.jpg", telephone: "+1-555-0147", streetAddress: "123 Innovation Way", city: "San Francisco", state: "CA", postalCode: "94105", country: "US", priceRange: "$$" });

     const cleanObject = (obj: any): any => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== "" && v !== null && v !== undefined));

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

     const schemaObject = useMemo(() => {
          let schemaObj: any = { "@context": "https://schema.org" };
          if (schemaType === "article") {
               schemaObj = { ...schemaObj, "@type": "Article", "headline": article.headline, "image": article.image ? [article.image] : undefined, "datePublished": article.datePublished, "author": article.authorName ? { "@type": "Person", "name": article.authorName } : undefined, "publisher": article.publisherName ? { "@type": "Organization", "name": article.publisherName, "logo": article.publisherLogo ? { "@type": "ImageObject", "url": article.publisherLogo } : undefined } : undefined, "description": article.description };
          } else if (schemaType === "product") {
               schemaObj = { ...schemaObj, "@type": "Product", "name": product.name, "image": product.image ? [product.image] : undefined, "description": product.description, "sku": product.sku, "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined, "offers": product.price ? { "@type": "Offer", "priceCurrency": product.currency, "price": product.price, "availability": `https://schema.org/${product.availability}` } : undefined };
          } else if (schemaType === "faq") {
               schemaObj = { ...schemaObj, "@type": "FAQPage", "mainEntity": faqs.filter(f => f.question.trim()).map(f => ({ "@type": "Question", "name": f.question, "acceptedAnswer": { "@type": "Answer", "text": f.answer } })) };
          } else if (schemaType === "organization") {
               const socialLinks = organization.sameAs.split(",").map(s => s.trim()).filter(Boolean);
               schemaObj = { ...schemaObj, "@type": "Organization", "name": organization.name, "url": organization.url, "logo": organization.logo, "sameAs": socialLinks.length > 0 ? socialLinks : undefined, "contactPoint": organization.contactPhone ? { "@type": "ContactPoint", "telephone": organization.contactPhone, "contactType": "customer service" } : undefined };
          } else if (schemaType === "localBusiness") {
               schemaObj = { ...schemaObj, "@type": "LocalBusiness", "name": localBiz.name, "image": localBiz.image, "telephone": localBiz.telephone, "priceRange": localBiz.priceRange, "address": { "@type": "PostalAddress", "streetAddress": localBiz.streetAddress, "addressLocality": localBiz.city, "addressRegion": localBiz.state, "postalCode": localBiz.postalCode, "addressCountry": localBiz.country } };
          }
          return cleanObject(schemaObj);
     }, [schemaType, article, product, faqs, organization, localBiz]);

     const jsonLdString = isMinified ? JSON.stringify(schemaObject) : JSON.stringify(schemaObject, null, 2);
     const rawCopyCode = `<script type="application/ld+json">\n${jsonLdString}\n</script>`;

     const highlightedJson = useMemo(() => {
          let highlighted = jsonLdString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          highlighted = highlighted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
               let cls = 'text-emerald-400';
               if (/^"/.test(match)) { if (/:$/.test(match)) cls = 'text-cyan-400 font-bold'; }
               else if (/true|false/.test(match)) cls = 'text-pink-400 font-bold';
               else if (/null/.test(match)) cls = 'text-gray-500 font-bold';
               else cls = 'text-amber-400';
               return `<span class="${cls}">${match}</span>`;
          });
          return `<span class="text-gray-500">&lt;script type="application/ld+json"&gt;</span>\n${highlighted}\n<span class="text-gray-500">&lt;/script&gt;</span>`;
     }, [jsonLdString]);

     const copyJsonLd = () => { navigator.clipboard.writeText(rawCopyCode); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
     const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
     const removeFaq = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
     const updateFaq = (index: number, field: "question" | "answer", val: string) => { const updated = [...faqs]; updated[index][field] = val; setFaqs(updated); };

     return (
          <div className="w-full flex flex-col gap-6">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                              <Code size={24} />
                         </div>
                         <div>
                              <div className="flex items-center gap-3">
                                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Schema Markup (JSON-LD) Generator</h2>
                                   <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                        🟢 100% Free
                                   </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">Generate validated structured data with real-time Google Rich Results validation and payload minification.</p>
                         </div>
                    </div>
               </div>

               <AdSlot adSlot="top-schema-ad" format="horizontal" minHeight="90px" className="hidden md:flex mb-2" />

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-5 flex flex-col gap-6">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col gap-6 shadow-sm dark:shadow-xl transition-colors">
                              <div className="space-y-3">
                                   <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Select Schema Type</label>
                                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        <button onClick={() => setSchemaType("article")} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "article" ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <FileText size={16} /> Article
                                        </button>
                                        <button onClick={() => setSchemaType("product")} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "product" ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <ShoppingBag size={16} /> Product
                                        </button>
                                        <button onClick={() => setSchemaType("faq")} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "faq" ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <HelpCircle size={16} /> FAQ Page
                                        </button>
                                        <button onClick={() => setSchemaType("organization")} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all ${schemaType === "organization" ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <Building2 size={16} /> Business
                                        </button>
                                        <button onClick={() => setSchemaType("localBusiness")} className={`p-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 border transition-all col-span-2 sm:col-span-2 ${schemaType === "localBusiness" ? "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-300 shadow-sm dark:shadow-none" : "bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700"}`}>
                                             <Globe size={16} /> Local Business
                                        </button>
                                   </div>
                              </div>

                              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
                                   {schemaType === "article" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Headline / Article Title</label>
                                                  <input type="text" value={article.headline} onChange={(e) => setArticle({ ...article, headline: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Article Description</label>
                                                  <textarea value={article.description} onChange={(e) => setArticle({ ...article, description: e.target.value })} rows={2} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 resize-none transition-colors" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Author Name</label>
                                                       <input type="text" value={article.authorName} onChange={(e) => setArticle({ ...article, authorName: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Date Published</label>
                                                       <input type="date" value={article.datePublished} onChange={(e) => setArticle({ ...article, datePublished: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Publisher Name</label>
                                                       <input type="text" value={article.publisherName} onChange={(e) => setArticle({ ...article, publisherName: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Publisher Logo URL</label>
                                                       <input type="text" value={article.publisherLogo} onChange={(e) => setArticle({ ...article, publisherLogo: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                             </div>
                                        </>
                                   )}

                                   {schemaType === "product" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Product Name</label>
                                                  <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Description</label>
                                                  <textarea value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} rows={2} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 resize-none transition-colors" />
                                             </div>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Brand Name</label>
                                                       <input type="text" value={product.brand} onChange={(e) => setProduct({ ...product, brand: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">SKU</label>
                                                       <input type="text" value={product.sku} onChange={(e) => setProduct({ ...product, sku: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                             </div>
                                             <div className="grid grid-cols-3 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Price</label>
                                                       <input type="text" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Currency</label>
                                                       <input type="text" value={product.currency} onChange={(e) => setProduct({ ...product, currency: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Availability</label>
                                                       <select value={product.availability} onChange={(e) => setProduct({ ...product, availability: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-2 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors">
                                                            <option value="InStock">In Stock</option>
                                                            <option value="OutOfStock">Out of Stock</option>
                                                            <option value="PreOrder">Pre-Order</option>
                                                       </select>
                                                  </div>
                                             </div>
                                        </>
                                   )}

                                   {schemaType === "faq" && (
                                        <div className="space-y-3">
                                             {faqs.map((faq, index) => (
                                                  <div key={index} className="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl space-y-2 relative group transition-colors">
                                                       <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase">Question #{index + 1}</span>
                                                            {faqs.length > 1 && (
                                                                 <button onClick={() => removeFaq(index)} className="text-gray-400 dark:text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                                                                      <Trash2 size={14} />
                                                                 </button>
                                                            )}
                                                       </div>
                                                       <input type="text" placeholder="Question..." value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                                       <textarea placeholder="Answer..." value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} rows={2} className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 resize-none transition-colors" />
                                                  </div>
                                             ))}
                                             <button onClick={addFaq} className="w-full py-2 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-sm dark:shadow-none">
                                                  <Plus size={14} /> Add FAQ Item
                                             </button>
                                        </div>
                                   )}

                                   {schemaType === "organization" && (
                                        <>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Organization Name</label>
                                                  <input type="text" value={organization.name} onChange={(e) => setOrganization({ ...organization, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Official Website URL</label>
                                                  <input type="text" value={organization.url} onChange={(e) => setOrganization({ ...organization, url: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Logo URL</label>
                                                  <input type="text" value={organization.logo} onChange={(e) => setOrganization({ ...organization, logo: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Social Profiles (Comma-separated)</label>
                                                  <input type="text" value={organization.sameAs} onChange={(e) => setOrganization({ ...organization, sameAs: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                             </div>
                                        </>
                                   )}

                                   {schemaType === "localBusiness" && (
                                        <>
                                             <div className="grid grid-cols-2 gap-3">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Business Name</label>
                                                       <input type="text" value={localBiz.name} onChange={(e) => setLocalBiz({ ...localBiz, name: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Telephone</label>
                                                       <input type="text" value={localBiz.telephone} onChange={(e) => setLocalBiz({ ...localBiz, telephone: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 font-mono transition-colors" />
                                                  </div>
                                             </div>
                                             <div>
                                                  <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Street Address</label>
                                                  <input type="text" value={localBiz.streetAddress} onChange={(e) => setLocalBiz({ ...localBiz, streetAddress: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3.5 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none focus:border-cyan-500/50 transition-colors" />
                                             </div>
                                             <div className="grid grid-cols-3 gap-2">
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">City</label>
                                                       <input type="text" value={localBiz.city} onChange={(e) => setLocalBiz({ ...localBiz, city: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">State</label>
                                                       <input type="text" value={localBiz.state} onChange={(e) => setLocalBiz({ ...localBiz, state: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none transition-colors" />
                                                  </div>
                                                  <div>
                                                       <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase block mb-1">Zip Code</label>
                                                       <input type="text" value={localBiz.postalCode} onChange={(e) => setLocalBiz({ ...localBiz, postalCode: e.target.value })} className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-900 dark:text-gray-200 outline-none font-mono transition-colors" />
                                                  </div>
                                             </div>
                                        </>
                                   )}
                              </div>
                         </div>
                    </div>

                    <div className="lg:col-span-7 flex flex-col gap-6">
                         {validationWarnings.length > 0 && (
                              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 flex flex-col gap-2 transition-colors shadow-sm dark:shadow-none">
                                   <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-bold">
                                        <AlertTriangle size={16} /> Rich Results Validation Issues
                                   </div>
                                   <ul className="list-disc ml-5 space-y-1">
                                        {validationWarnings.map((w, i) => (
                                             <li key={i} className="text-[11px] text-amber-800 dark:text-amber-200/80">{w}</li>
                                        ))}
                                   </ul>
                              </div>
                         )}

                         <div className="bg-white dark:bg-[#0c121e] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm dark:shadow-xl flex flex-col gap-4 transition-colors h-full">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 dark:border-gray-800/80 pb-3 gap-4">
                                   <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className={validationWarnings.length > 0 ? "text-amber-500 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"} />
                                        <span className="text-xs font-bold text-gray-900 dark:text-gray-300 uppercase tracking-wider">Generated JSON-LD Snippet</span>
                                   </div>
                                   <div className="flex items-center gap-4">
                                        <button onClick={() => setIsMinified(!isMinified)} className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50 dark:bg-gray-950 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800">
                                             {isMinified ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
                                             {isMinified ? "Expand" : "Minify Payload"}
                                        </button>
                                        <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 px-3 py-1.5 rounded-lg border border-cyan-200 dark:border-cyan-500/20 hover:bg-cyan-100 dark:hover:bg-cyan-500/20 flex items-center gap-1.5 transition-colors">
                                             Test Output <ExternalLink size={12} />
                                        </a>
                                   </div>
                              </div>

                              <div className="relative group flex-grow">
                                   {/* Kept strictly dark to preserve exact syntax highlighting colors */}
                                   <pre className="bg-[#0d1117] border border-gray-800 rounded-2xl p-5 text-xs font-mono leading-relaxed overflow-x-auto min-h-[300px] h-full shadow-inner" dangerouslySetInnerHTML={{ __html: highlightedJson }} />
                              </div>

                              <button onClick={copyJsonLd} className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all shadow-md dark:shadow-lg dark:shadow-cyan-500/20 flex items-center justify-center gap-2 mt-auto">
                                   {isCopied ? <><Check size={18} className="text-white" /> Script Copied to Clipboard!</> : <><Copy size={18} /> Copy JSON-LD Code Snippet</>}
                              </button>
                         </div>
                    </div>
               </div>

               {/* ========================================= */}
               {/* SEO CONTENT & FAQS */}
               {/* ========================================= */}
               <div className="mt-12 bg-white dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 md:p-10 shadow-sm dark:shadow-none">
                    <div className="prose dark:prose-invert max-w-none">
                         <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">JSON-LD Schema Markup Generator for Technical SEO</h2>
                         <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                              Search engines like Google rely on structured data to understand the content of a page and display rich results (like star ratings, FAQs, or product prices directly in the search results). The ToolLok <strong>Schema Markup Generator</strong> allows developers and marketers to instantly generate valid JSON-LD code for Articles, Products, Local Businesses, and FAQs. Incorporate this tool alongside our <Link href="/categories/seo-tools" className="text-cyan-600 dark:text-cyan-400 hover:underline">SEO Tools</Link> to dominate the SERPs.
                         </p>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features</h3>
                         <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-8">
                              <li><strong>Live Validation Engine:</strong> The generator cross-references your inputs against Google's Rich Result guidelines in real-time, warning you if a required property (like a Product Price or Article Image) is missing.</li>
                              <li><strong>Zero-Dependency Client-Side Parsing:</strong> All JSON-LD generation and payload minification happens instantly in your browser. No data is sent to external servers.</li>
                              <li><strong>One-Click Minification:</strong> Condense your generated JSON-LD payload into a single line to save valuable bytes and improve your page load speed.</li>
                         </ul>

                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h3>
                         <div className="space-y-4">
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">What is JSON-LD?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">JSON-LD (JavaScript Object Notation for Linked Data) is a lightweight Linked Data format. It is Google's highly recommended method for adding structured data to web pages because it allows you to inject the data via a `&lt;script&gt;` block rather than wrapping HTML elements.</p>
                              </div>
                              <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                                   <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Where do I paste the generated schema?</h4>
                                   <p className="text-xs text-gray-600 dark:text-gray-400">You should copy the generated `&lt;script type="application/ld+json"&gt;` snippet and paste it within the `&lt;head&gt;` section of your HTML document, although placing it near the bottom of the `&lt;body&gt;` is also acceptable if needed for performance reasons.</p>
                              </div>
                         </div>
                    </div>

                    <script
                         type="application/ld+json"
                         dangerouslySetInnerHTML={{
                              __html: JSON.stringify({
                                   "@context": "https://schema.org",
                                   "@type": "FAQPage",
                                   "mainEntity": [
                                        {
                                             "@type": "Question",
                                             "name": "What is JSON-LD?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "JSON-LD is a lightweight Linked Data format recommended by Google for adding structured data via a script block." }
                                        },
                                        {
                                             "@type": "Question",
                                             "name": "Where do I paste the generated schema?",
                                             "acceptedAnswer": { "@type": "Answer", "text": "Copy the generated snippet and paste it within the head section of your HTML document." }
                                        }
                                   ]
                              })
                         }}
                    />
               </div>

               <AdSlot adSlot="bottom-schema-ad" format="fluid" className="mt-4" />
          </div>
     );
}