import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Trash2,
  Settings,
  Eye,
  Save,
  Copy,
  Calculator,
  Palette,
  Mail,
  Layers,
  Type,
  ToggleLeft,
  Circle,
  Sliders,
  Calendar,
  Hash,
  Upload,
  Share2,
  Download,
  BarChart3,
  X,
  Phone,
  Image as ImageIcon,
  Clock,
  Code,
  Users,
  Minus,
  Folder,
  ChevronDown,
} from 'lucide-react';

// This component is for the public-facing calculator page.
const PublicCalculatorView = ({ calculator, brandSettings }) => {
    const [formElements, setFormElements] = useState(calculator.elements || []);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const jpgExportRef = useRef(null);

    const handleUpdateElement = (id, key, value) => {
        const update = (elements) => {
            return elements.map(el => {
                if (el.id === id) return { ...el, [key]: value };
                if (el.children) return { ...el, children: update(el.children) };
                return el;
            });
        };
        setFormElements(prev => update(prev));
    };
    
    const calculateTotal = () => {
        let total = 0;
        const calculate = (elements) => {
            elements.forEach(el => {
                if (el.type === 'number' && el.value) total += parseFloat(el.value) * (el.cost || 0);
                else if (['select', 'radio', 'image-select'].includes(el.type) && el.value) {
                    const option = el.options.find(opt => opt.value === el.value);
                    if (option) total += option.cost || 0;
                } else if (el.type === 'slider' && el.value) {
                     total += parseFloat(el.value) * (el.cost || 0);
                }
                if(el.children) calculate(el.children);
            });
        }
        calculate(formElements);
        setTotalCost(total);
    };

    useEffect(() => {
        calculateTotal();
    }, [formElements]);

    const pages = formElements.reduce((acc, element) => {
        if (element.type === 'pagebreak') acc.push([]);
        else if (acc.length === 0) acc.push([element]);
        else acc[acc.length - 1].push(element);
        return acc;
    }, []);
    if (pages.length === 0 && formElements.length > 0) pages.push(formElements);
    else if(pages.length === 0) pages.push([]);

    const getSummaryItems = () => {
      let items = [];
      const collectItems = (elements) => {
          elements.forEach(element => {
              let item = null;
              const baseItem = { type: element.type, label: element.label, value: element.value };
              if (element.type === 'number' && element.value) {
                item = { ...baseItem, qty: element.value, rate: element.cost || 0, amount: parseFloat(element.value) * (element.cost || 0) };
              } else if (['select', 'radio', 'image-select'].includes(element.type) && element.value) {
                const option = element.options.find(opt => opt.value === element.value);
                if (option) item = { ...baseItem, description: option.label, qty: 1, rate: option.cost || 0, amount: option.cost || 0 };
              } else if ((element.type === 'text' || element.type === 'validated-input') && element.value) {
                  item = { ...baseItem, description: element.value, qty: 1, rate: 0, amount: 0 };
              }
              if(item) items.push(item);
              if(element.children) collectItems(element.children);
          });
      }
      collectItems(formElements);
      return items;
    };
    
      const generatePDF = () => {
        const summary = getSummaryItems();
        const date = new Date();
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + 15);
        
        const pdfContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Estimate - ${brandSettings.companyName}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              @page { size: A4; margin: 0; }
              body { font-family: 'Inter', sans-serif; margin: 0; color: #111827; background-color: #ffffff; -webkit-print-color-adjust: exact; }
              .page { width: 210mm; min-height: 297mm; padding: 40px; box-sizing: border-box; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
              .header-left .logo { height: 30px; width: auto; margin-bottom: 20px; }
              .header-left h1 { font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }
              .header-left p { margin: 0; font-size: 14px; color: #6B7280; }
              .header-right { text-align: right; }
              .header-right h2 { font-size: 28px; font-weight: 700; margin: 0 0 5px 0; letter-spacing: 0.025em; }
              .header-right p { margin: 0; font-size: 14px; color: #6B7280; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .details .section h3 { font-size: 12px; color: #6B7280; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em;}
              .details .section p { margin: 0; font-size: 14px; font-weight: 500; line-height: 1.6; }
              .items-table { width: 100%; border-collapse: collapse; }
              .items-table th { padding: 10px 0; text-align: left; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
              .items-table td { padding: 15px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
              .items-table .item-name { font-weight: 600; color: #111827; }
              .items-table .item-desc { font-size: 13px; color: #6B7280; }
              .items-table .align-right { text-align: right; }
              .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
              .summary-box { width: 280px; }
              .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
              .summary-row.total { font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 5px; }
              .amount-due { background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
              .amount-due span { font-size: 16px; font-weight: 600; }
              .amount-due .total-price { font-size: 20px; font-weight: 700; color: ${brandSettings.primaryColor}; }
              .notes { margin-top: 40px; }
              .notes h3 { font-size: 12px; color: #6B7280; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em; }
              .notes p { margin: 0; font-size: 14px; color: #6B7280; }
            </style>
          </head>
          <body>
            <div class="page">
              <div class="header">
                <div class="header-left">
                  ${brandSettings.companyLogo ? `<img src="${brandSettings.companyLogo}" alt="Logo" class="logo">` : `<h1>${brandSettings.companyName}</h1>`}
                  <p>Covent Garden, London</p>
                  <p>ali@designvalley.io</p>
                </div>
                <div class="header-right">
                  <h2>ESTIMATE</h2>
                  <p>#EST-${Date.now().toString().slice(-4)}</p>
                </div>
              </div>
              <div class="details">
                <div class="section"><h3>Bill To</h3><p>Your Client's Name</p><p>Client's Address</p><p>client@email.com</p></div>
                <div class="section" style="text-align: right;"><h3>Estimate Date</h3><p>${date.toLocaleDateString()}</p><h3 style="margin-top: 20px;">Valid Until</h3><p>${dueDate.toLocaleDateString()}</p></div>
              </div>
              <table class="items-table">
                <thead><tr><th>Description</th><th class="align-right">Qty</th><th class="align-right">Rate</th><th class="align-right">Amount</th></tr></thead>
                <tbody>${summary.map(item => `<tr><td><div class="item-name">${item.label}</div><div class="item-desc">${item.description || ''}</div></td><td class="align-right">${item.qty}</td><td class="align-right">$${item.rate.toFixed(2)}</td><td class="align-right">$${item.amount.toFixed(2)}</td></tr>`).join('')}</tbody>
              </table>
              <div class="summary"><div class="summary-box"><div class="summary-row"><span>Subtotal</span><span>$${totalCost.toFixed(2)}</span></div><div class="summary-row"><span>Tax (0%)</span><span>$0.00</span></div><div class="summary-row total"><span>Total</span><span>$${totalCost.toFixed(2)}</span></div><div class="amount-due"><span>Amount Due</span><span class="total-price">$${totalCost.toFixed(2)}</span></div></div></div>
              <div class="notes"><h3>Notes</h3><p>Thank you for your business! We appreciate your prompt payment.</p></div>
            </div>
            <script>window.onload = () => window.print();</script>
          </body>
        </html>`;
        
        const blob = new Blob([pdfContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 100);
      };
      
      const generateJPG = () => {
        if (typeof window.html2canvas === 'undefined') {
            alert('JPG generation library is not loaded. Please wait a moment and try again.');
            return;
        }
    
        const summaryNode = jpgExportRef.current;
        if (summaryNode) {
            window.html2canvas(summaryNode, { 
                useCORS: true, 
                backgroundColor: '#ffffff',
                scale: 2 
            }).then(canvas => {
                const image = canvas.toDataURL('image/jpeg', 0.95);
                const link = document.createElement('a');
                link.href = image;
                link.download = `estimate-${Date.now()}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }).catch(err => {
                console.error("Error generating JPG:", err);
                alert("Sorry, there was an error generating the JPG image.");
            });
        }
      };


    // This is a simplified renderer for the public view
    const renderPublicFormElement = (element) => {
      // Simplified version of the main renderer
      const baseClasses = "w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all";
      const update = (key, value) => handleUpdateElement(element.id, key, value);
      const Label = () => <label className="block text-sm font-medium text-gray-700 mb-1">{element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</label>;
      
      switch (element.type) {
        case 'text': return <div><Label /><input type="text" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>;
        case 'number': return <div><Label /><input type="number" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>;
        case 'select': return <div><Label /><select className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)}><option value="">Select...</option>{element.options.map((o, i) => <option key={i} value={o.value}>{o.label} {o.cost > 0 && `(+$${o.cost.toFixed(2)})`}</option>)}</select></div>;
        case 'slider': return <div><Label>{element.label}: {element.value || element.min}</Label><div className="flex items-center gap-4"><span className="text-xs">{element.min}</span><input type="range" min={element.min} max={element.max} step={element.step} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb" value={element.value || element.min} onChange={(e) => update('value', e.target.value)} /><span className="text-xs">{element.max}</span></div></div>;
        default: return null;
      }
    }

    return (
        <div className="flex flex-col md:flex-row h-screen bg-slate-50 font-sans">
          <div className={`flex-1 p-4 sm:p-8 overflow-y-auto`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-4xl mx-auto">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{calculator.name}</h1>
                <p className="text-gray-500">{calculator.description}</p>
              </div>
              <div className="p-8 border-t border-gray-100">
                {pages.length > 1 && (<div className="mb-6"><div className="flex justify-between items-center mb-2"><span className="text-sm font-semibold text-gray-500">Step {currentPage + 1} of {pages.length}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}></div></div></div>)}
                <div className="space-y-6">{pages[currentPage]?.map(el => renderPublicFormElement(el))}</div>
                {pages.length > 1 && (<div className="flex justify-between pt-6 mt-6 border-t"><button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold">Previous</button><button onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} disabled={currentPage >= pages.length - 1} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-semibold">Next</button></div>)}
              </div>
            </div>
          </div>
          <div className="w-full md:w-96 flex-shrink-0 p-4 sm:p-8 md:pl-0">
              <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col">
                 <div className="p-6 bg-white rounded-t-2xl flex-grow">
                    <div ref={jpgExportRef}>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
                        {getSummaryItems().length > 0 ? (
                        <>
                            <div className="-mx-6 px-6">
                                <div className="space-y-3">
                                    {getSummaryItems().map((item, i) => (
                                        <div key={i} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-b-0 text-sm">
                                            <div>
                                                <span className="font-medium text-slate-700">{item.label}</span>
                                                {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                                            </div>
                                            <span className="text-right font-medium text-slate-700">
                                            {item.amount > 0 ? `$${item.amount.toFixed(2)}` : (item.value || '')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t-2 border-slate-200 mt-4">
                            <div className="flex justify-between items-center text-sm font-medium text-slate-500"><span>Subtotal</span><span>${totalCost.toFixed(2)}</span></div>
                            <div className="flex justify-between items-center text-sm font-medium text-slate-500 mt-2"><span>Tax (0%)</span><span>$0.00</span></div>
                            <div className="flex justify-between items-center text-lg font-bold text-slate-800 mt-3"><span>Total</span><span>${totalCost.toFixed(2)}</span></div>
                            </div>
                        </>
                        ) : (<div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center h-full"><Calculator className="w-10 h-10 mb-2 text-gray-300" /><span>Your estimate will appear here.</span></div>)}
                    </div>
                </div>
                 {getSummaryItems().length > 0 && 
                <div className="p-6 pt-4 mt-auto border-t border-slate-200 space-y-2">
                  <button onClick={generatePDF} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"><Download className="w-4 h-4"/>Download PDF</button>
                  <button onClick={generateJPG} className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"><ImageIcon className="w-4 h-4"/>Download JPG</button>
                </div>
                }
              </div>
          </div>
        </div>
    );
}

// Main Application Component
const CostCalculatorApp = () => {
  // #region STATE MANAGEMENT
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formElements, setFormElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dropTarget, setDropTarget] = useState(null); 
  const [previewMode, setPreviewMode] = useState('desktop');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showBrandSettings, setShowBrandSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareLinkModal, setShowShareLinkModal] = useState(null);
  const [currentCalculatorId, setCurrentCalculatorId] = useState(null);
  const [calculatorName, setCalculatorName] = useState('');
  const [calculatorDescription, setCalculatorDescription] = useState('');
  const jpgExportRef = useRef(null);
  const [publicCalculator, setPublicCalculator] = useState(null);

  // Dynamically load html2canvas script
  useEffect(() => {
    const scriptId = 'html2canvas-script';
    if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.async = true;
        document.body.appendChild(script);
    }
  }, []);

  const [savedCalculators, setSavedCalculators] = useState([
    {
      id: 1,
      name: 'Website Development Calculator',
      description: 'Calculate costs for web development projects.',
      elements: [
        { id: 1625100000001, type: 'select', label: 'Type of Website', options: [{label: 'Brochure', value: 'brochure', cost: 500}, {label: 'E-commerce', value: 'e-commerce', cost: 2000}], value: 'brochure' },
        { id: 1625100000002, type: 'number', label: 'Number of Pages', value: 5, cost: 150 },
      ],
      createdAt: '2025-06-21', submissions: 45, status: 'Published'
    },
  ]);
  
  // Routing logic
  useEffect(() => {
      const path = window.location.pathname;
      if (path.startsWith('/calc/')) {
          const calcId = parseInt(path.split('/calc/')[1]);
          const calculator = savedCalculators.find(c => c.id === calcId);
          if (calculator) {
              setPublicCalculator(calculator);
          }
      }
  }, [savedCalculators]);

  const [brandSettings, setBrandSettings] = useState({
    companyLogo: null,
    primaryColor: '#6366F1', // Indigo-500
    secondaryColor: '#4F46E5', // Indigo-600
    companyName: 'DesignValley LTD'
  });
  // #endregion

  // #region DATA & CONSTANTS
  const formElementTypes = {
    TYPE: [
      { type: 'text', icon: Type, label: 'Text field' },
      { type: 'number', icon: Hash, label: 'Quantity field' },
      { type: 'validated-input', icon: Phone, label: 'Validated form' },
    ],
    SELECTION: [
      { type: 'select', icon: ToggleLeft, label: 'Dropdown' },
      { type: 'image-select', icon: ImageIcon, label: 'Image dropdown' },
      { type: 'radio', icon: Circle, label: 'Radio select' },
    ],
    'DATE AND TIME': [
      { type: 'date', icon: Calendar, label: 'Date picker' },
      { type: 'time', icon: Clock, label: 'Time picker' },
    ],
    SLIDER: [
      { type: 'slider', icon: Sliders, label: 'Basic slider' },
    ],
    OTHER: [
      { type: 'file', icon: Upload, label: 'File upload' },
      { type: 'html', icon: Code, label: 'HTML' },
    ],
    GROUPING: [
      { type: 'group', icon: Users, label: 'Group' },
      { type: 'divider', icon: Minus, label: 'Divider' },
      { type: 'pagebreak', icon: Layers, label: 'Page breaker' },
      { type: 'section', icon: Folder, label: 'Section' },
    ]
  };
  // #endregion

  // #region DRAG & DROP LOGIC
  const handleDragStart = (e, elementType) => {
    setDraggedElement({ ...elementType, isNew: true });
  };

  const handleElementDragStart = (e, element, parentId = null) => {
    e.stopPropagation();
    setDraggedElement({ element, parentId, isNew: false });
  };
  
  const handleDragOver = (e, parentId = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(parentId);
  };
  
  const handleDrop = (e, parentId = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (!draggedElement) return;

    let newFormElements = [...formElements];

    if (!draggedElement.isNew) {
        const removeElement = (elements, elId) => {
            let list = elements.filter(el => el.id !== elId);
            return list.map(el => {
                if (el.children) {
                    return { ...el, children: removeElement(el.children, elId) };
                }
                return el;
            });
        }
        newFormElements = removeElement(newFormElements, draggedElement.element.id);
    }

    const elementToDrop = draggedElement.isNew
        ? {
            id: Date.now(),
            type: draggedElement.type,
            label: `${draggedElement.label}`,
            value: '',
            cost: 0,
            options: ['select', 'radio', 'image-select'].includes(draggedElement.type) 
                ? [{ label: 'Option 1', value: 'opt1', cost: 10, imageUrl: null }] : [],
            children: draggedElement.type === 'group' ? [] : undefined,
            validationType: 'text', min: 0, max: 100, step: 1, htmlContent: ''
        }
        : draggedElement.element;
    
    const addElement = (elements, pId) => {
        if (pId === null) {
            return [...elements, elementToDrop];
        }
        return elements.map(el => {
            if (el.id === pId) {
                return { ...el, children: [...(el.children || []), elementToDrop] };
            }
            if (el.children) {
                return { ...el, children: addElement(el.children, pId) };
            }
            return el;
        });
    };
    
    setFormElements(addElement(newFormElements, parentId));
    setDraggedElement(null);
    setDropTarget(null);
  };
  
  // #endregion

  // #region CORE CALCULATOR LOGIC
  const calculateTotal = () => {
    let total = 0;
    const calculate = (elements) => {
        elements.forEach(el => {
            if (el.type === 'number' && el.value) total += parseFloat(el.value) * (el.cost || 0);
            else if (el.type === 'checkbox' && el.checked) total += el.cost || 0;
            else if (['select', 'radio', 'image-select'].includes(el.type) && el.value) {
                const option = el.options.find(opt => opt.value === el.value);
                if (option) total += option.cost || 0;
            } else if (el.type === 'slider' && el.value) {
                 total += parseFloat(el.value) * (el.cost || 0);
            }
            if(el.children) calculate(el.children);
        });
    }
    calculate(formElements);
    setTotalCost(total);
  };

  useEffect(() => {
    calculateTotal();
  }, [formElements]);

  const pages = formElements.reduce((acc, element) => {
    if (element.type === 'pagebreak') acc.push([]);
    else if (acc.length === 0) acc.push([element]);
    else acc[acc.length - 1].push(element);
    return acc;
  }, []);
  
  if (pages.length > 0 && pages[pages.length - 1].length === 0) pages.pop();
  else if (pages.length === 0) pages.push([]);

  const getSummaryItems = () => {
    let items = [];
    const collectItems = (elements) => {
        elements.forEach(element => {
            let item = null;
            const baseItem = { type: element.type, label: element.label, value: element.value };
            if (element.type === 'number' && element.value) {
              item = { ...baseItem, qty: element.value, rate: element.cost || 0, amount: parseFloat(element.value) * (element.cost || 0) };
            } else if (['select', 'radio', 'image-select'].includes(element.type) && element.value) {
              const option = element.options.find(opt => opt.value === element.value);
              if (option) item = { ...baseItem, description: option.label, qty: 1, rate: option.cost || 0, amount: option.cost || 0 };
            } else if ((element.type === 'text' || element.type === 'validated-input') && element.value) {
                item = { ...baseItem, description: element.value, qty: 1, rate: 0, amount: 0 };
            }
            if(item) items.push(item);
            if(element.children) collectItems(element.children);
        });
    }
    collectItems(formElements);
    return items;
  };
  // #endregion

  // #region CRUD & DATA HANDLING
  const handleUpdateElement = (id, key, value) => {
    const update = (elements) => {
        return elements.map(el => {
            if (el.id === id) return { ...el, [key]: value };
            if (el.children) return { ...el, children: update(el.children) };
            return el;
        });
    };
    setFormElements(prev => update(prev));
  };
  
  const handleDeleteElement = (id) => {
    const remove = (elements) => {
        let filtered = elements.filter(el => el.id !== id);
        if (filtered.length !== elements.length) return filtered;
        return elements.map(el => {
            if (el.children) return { ...el, children: remove(el.children) };
            return el;
        });
    };
    setFormElements(prev => remove(prev));
    if (selectedElement === id) setSelectedElement(null);
  };
  
  const saveCalculator = () => {
    if (!calculatorName.trim()) { alert('Please enter a calculator name.'); return; }
    const newId = currentCalculatorId || Date.now();
    const newCalculator = {
      id: newId,
      name: calculatorName, description: calculatorDescription, elements: formElements,
      createdAt: new Date().toISOString().split('T')[0],
      submissions: currentCalculatorId ? savedCalculators.find(c => c.id === currentCalculatorId)?.submissions || 0 : 0,
      status: 'Draft',
    };
    if (currentCalculatorId) setSavedCalculators(prev => prev.map(c => c.id === currentCalculatorId ? newCalculator : c));
    else setSavedCalculators(prev => [...prev, newCalculator]);
    setShowSaveModal(false); setActiveTab('dashboard');
  };
  
  const loadCalculator = (calculator) => {
    setFormElements(calculator.elements || []);
    setCurrentCalculatorId(calculator.id); setCalculatorName(calculator.name);
    setCalculatorDescription(calculator.description); setActiveTab('builder');
  };

  const deleteCalculator = (id) => {
    if (window.confirm('Are you sure you want to delete this calculator?')) setSavedCalculators(prev => prev.filter(calc => calc.id !== id));
  };

  const createNewCalculator = () => {
    setFormElements([]); setCurrentCalculatorId(null);
    setCalculatorName('Untitled Calculator'); setCalculatorDescription('');
    setSelectedElement(null); setActiveTab('builder');
  };
  
  // #endregion

  // #region PDF & SHARING
  const generatePDF = () => {
    const summary = getSummaryItems();
    const date = new Date();
    const dueDate = new Date(date);
    dueDate.setDate(dueDate.getDate() + 15);
    
    const pdfContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Estimate - ${brandSettings.companyName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          @page { size: A4; margin: 0; }
          body { font-family: 'Inter', sans-serif; margin: 0; color: #111827; background-color: #ffffff; -webkit-print-color-adjust: exact; }
          .page { width: 210mm; min-height: 297mm; padding: 40px; box-sizing: border-box; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
          .header-left .logo { height: 30px; width: auto; margin-bottom: 20px; }
          .header-left h1 { font-size: 16px; font-weight: 600; margin: 0 0 5px 0; }
          .header-left p { margin: 0; font-size: 14px; color: #6B7280; }
          .header-right { text-align: right; }
          .header-right h2 { font-size: 28px; font-weight: 700; margin: 0 0 5px 0; letter-spacing: 0.025em; }
          .header-right p { margin: 0; font-size: 14px; color: #6B7280; }
          
          .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .details .section h3 { font-size: 12px; color: #6B7280; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em;}
          .details .section p { margin: 0; font-size: 14px; font-weight: 500; line-height: 1.6; }

          .items-table { width: 100%; border-collapse: collapse; }
          .items-table th { padding: 10px 0; text-align: left; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
          .items-table td { padding: 15px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb; }
          .items-table .item-name { font-weight: 600; color: #111827; }
          .items-table .item-desc { font-size: 13px; color: #6B7280; }
          .items-table .align-right { text-align: right; }

          .summary { display: flex; justify-content: flex-end; margin-top: 20px; }
          .summary-box { width: 280px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .summary-row.total { font-weight: 600; border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 5px; }
          .amount-due { background-color: #F3F4F6; border: 1px solid #E5E7EB; border-radius: 8px; padding: 15px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
          .amount-due span { font-size: 16px; font-weight: 600; }
          .amount-due .total-price { font-size: 20px; font-weight: 700; color: ${brandSettings.primaryColor}; }
          
          .notes { margin-top: 40px; }
          .notes h3 { font-size: 12px; color: #6B7280; font-weight: 600; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.05em; }
          .notes p { margin: 0; font-size: 14px; color: #6B7280; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <div class="header-left">
              ${brandSettings.companyLogo ? `<img src="${brandSettings.companyLogo}" alt="Logo" class="logo">` : `<h1>${brandSettings.companyName}</h1>`}
              <p>Covent Garden, London</p>
              <p>ali@designvalley.io</p>
            </div>
            <div class="header-right">
              <h2>ESTIMATE</h2>
              <p>#EST-${Date.now().toString().slice(-4)}</p>
            </div>
          </div>
          <div class="details">
            <div class="section"><h3>Bill To</h3><p>Your Client's Name</p><p>Client's Address</p><p>client@email.com</p></div>
            <div class="section" style="text-align: right;"><h3>Estimate Date</h3><p>${date.toLocaleDateString()}</p><h3 style="margin-top: 20px;">Valid Until</h3><p>${dueDate.toLocaleDateString()}</p></div>
          </div>
          <table class="items-table">
            <thead><tr><th>Description</th><th class="align-right">Qty</th><th class="align-right">Rate</th><th class="align-right">Amount</th></tr></thead>
            <tbody>${summary.map(item => `<tr><td><div class="item-name">${item.label}</div><div class="item-desc">${item.description || ''}</div></td><td class="align-right">${item.qty}</td><td class="align-right">$${item.rate.toFixed(2)}</td><td class="align-right">$${item.amount.toFixed(2)}</td></tr>`).join('')}</tbody>
          </table>
          <div class="summary"><div class="summary-box"><div class="summary-row"><span>Subtotal</span><span>$${totalCost.toFixed(2)}</span></div><div class="summary-row"><span>Tax (0%)</span><span>$0.00</span></div><div class="summary-row total"><span>Total</span><span>$${totalCost.toFixed(2)}</span></div><div class="amount-due"><span>Amount Due</span><span class="total-price">$${totalCost.toFixed(2)}</span></div></div></div>
          <div class="notes"><h3>Notes</h3><p>Thank you for your business! We appreciate your prompt payment.</p></div>
        </div>
        <script>window.onload = () => window.print();</script>
      </body>
    </html>`;
    
    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };
  
  const generateJPG = () => {
    if (typeof window.html2canvas === 'undefined') {
        alert('JPG generation library is not loaded. Please wait a moment and try again.');
        return;
    }

    const summaryNode = jpgExportRef.current;
    if (summaryNode) {
        window.html2canvas(summaryNode, { 
            useCORS: true, 
            backgroundColor: '#ffffff',
            scale: 2 // Improve resolution
        }).then(canvas => {
            const image = canvas.toDataURL('image/jpeg', 0.95);
            const link = document.createElement('a');
            link.href = image;
            link.download = `estimate-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch(err => {
            console.error("Error generating JPG:", err);
            alert("Sorry, there was an error generating the JPG image.");
        });
    }
  };
  
  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert('Link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy link.');
      console.error('Fallback: Oops, unable to copy', err);
    }
    document.body.removeChild(textArea);
  };
  // #endregion

  // #region RENDER METHODS
  
  const ImageDropdown = ({ element, update }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const selectedOption = element.options.find(o => o.value === element.value);

    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-2 border rounded-lg flex items-center justify-between bg-white">
                {selectedOption ? (<div className="flex items-center gap-2">{selectedOption.imageUrl ? <img src={selectedOption.imageUrl} alt={selectedOption.label} className="w-8 h-8 object-cover rounded"/> : <ImageIcon className="w-8 h-8 text-gray-400"/>}<span>{selectedOption.label}</span></div>) : <span>Select...</span>}
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (<div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">{element.options.map((opt, i) => (<div key={i} onClick={() => { update('value', opt.value); setIsOpen(false); }} className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer">{opt.imageUrl ? <img src={opt.imageUrl} alt={opt.label} className="w-10 h-10 object-cover rounded"/> : <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center"><ImageIcon className="w-5 h-5 text-gray-400"/></div>}<span>{opt.label} {opt.cost > 0 && `(+$${o.cost.toFixed(2)})`}</span></div>))}</div>)}
        </div>
    )
  }

  const renderFormElement = (element, isPreview = false, parentId = null) => {
    const baseClasses = "w-full p-3 rounded-lg border border-gray-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all";
    const update = (key, value) => handleUpdateElement(element.id, key, value);

    const Label = ({ children }) => <label className="block text-sm font-medium text-gray-700 mb-1">{children || element.label}{element.required && <span className="text-red-500 ml-1">*</span>}</label>;

    const commonProps = { key: element.id };
    if (!isPreview) {
      commonProps.onClick = (e) => {e.stopPropagation(); setSelectedElement(element.id)};
      commonProps.onDragStart = (e) => handleElementDragStart(e, element, parentId);
      commonProps.draggable = true;
    }
    
    let content;
    switch (element.type) {
      case 'text': content = <div><Label /><input type="text" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>; break;
      case 'number': content = <div><Label /><input type="number" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>; break;
      case 'validated-input': content = <div><Label>{element.label} ({element.validationType})</Label><input type={element.validationType === 'email' ? 'email' : 'tel'} className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>; break;
      case 'date': content = <div><Label /><input type="date" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>; break;
      case 'time': content = <div><Label /><input type="time" className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)} /></div>; break;
      case 'file': content = <div><Label /><input type="file" className={baseClasses} /></div>; break;
      case 'html': content = <div dangerouslySetInnerHTML={{ __html: element.htmlContent }} />; break;
      case 'divider': content = <hr className="my-4" />; break;
      case 'section': content = <div className="p-4 bg-gray-100 rounded-lg"><h3 className="font-semibold text-lg">{element.label}</h3></div>; break;
      case 'select': content = <div><Label /><select className={baseClasses} value={element.value || ''} onChange={(e) => update('value', e.target.value)}><option value="">Select...</option>{element.options.map((o, i) => <option key={i} value={o.value}>{o.label} {o.cost > 0 && `(+$${o.cost.toFixed(2)})`}</option>)}</select></div>; break;
      case 'radio': content = <div><Label />{element.options.map((o, i) => <div key={i} className="flex items-center gap-2 mb-1"><input type="radio" id={`rb-${element.id}-${i}`} name={`radio-${element.id}`} value={o.value} checked={element.value === o.value} onChange={(e) => update('value', e.target.value)} className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" /><label htmlFor={`rb-${element.id}-${i}`} className="text-sm text-gray-700">{o.label} {o.cost > 0 && `(+$${o.cost.toFixed(2)})`}</label></div>)}</div>; break;
      case 'slider': content = <div><Label>{element.label}: {element.value || element.min}</Label><div className="flex items-center gap-4"><span className="text-xs">{element.min}</span><input type="range" min={element.min} max={element.max} step={element.step} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb" value={element.value || element.min} onChange={(e) => update('value', e.target.value)} /><span className="text-xs">{element.max}</span></div></div>; break;
      case 'image-select': content = <div><Label/><ImageDropdown element={element} update={update}/></div>; break;
      case 'group': content = (<div onDragOver={(e) => handleDragOver(e, element.id)} onDrop={(e) => handleDrop(e, element.id)} className={`p-4 border-2 rounded-lg min-h-[100px] ${dropTarget === element.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 border-dashed'}`}><h3 className="font-semibold mb-2">{element.label}</h3>{element.children && element.children.length > 0 ? element.children.map(child => renderFormElement(child, isPreview, element.id)) : <p className="text-xs text-gray-400 text-center">Drag elements here</p>}</div>); break;
      case 'pagebreak': content = isPreview ? null : <div className="flex items-center gap-2 p-2 border-t border-b border-dashed border-gray-400 my-4"><Layers className="w-4 h-4 text-gray-500" /><span className="text-sm font-medium text-gray-500">Page Break</span></div>; break;
      default: return null;
    }
    
    return (
        <div {...commonProps} className={`group relative transition-all ${!isPreview ? `p-4 rounded-lg border-2 ${selectedElement === element.id ? 'border-indigo-500 bg-indigo-50' : 'border-transparent hover:bg-gray-50'}` : 'my-2'}`}>
           {content}
            {!isPreview && <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e=>e.stopPropagation()}><button onClick={() => handleDeleteElement(element.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-4 h-4" /></button></div>}
        </div>
    )
  };

  const renderDashboardUI = () => (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div><h1 className="text-3xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-600">Manage your cost calculators</p></div>
          <button onClick={createNewCalculator} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow font-semibold w-full sm:w-auto"><Plus className="w-5 h-5" />New Calculator</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCalculators.map((calc) => (
            <div key={calc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md hover:scale-[1.02]">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3"><h2 className="text-lg font-bold text-gray-800">{calc.name}</h2><span className={`px-3 py-1 text-xs font-semibold rounded-full ${calc.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{calc.status}</span></div>
                <p className="text-gray-600 text-sm mb-4 h-10">{calc.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-5"><span >Created: {calc.createdAt}</span><span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" />{calc.submissions} submissions</span></div>
                <div className="flex gap-2">
                  <button onClick={() => loadCalculator(calc)} className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm">Edit</button>
                  <button onClick={() => setShowShareLinkModal(calc)} className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"><Share2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCalculator(calc.id)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  const renderBuilderUI = () => (
    <div className="flex flex-col md:flex-row h-full bg-gray-50">
      <div className="w-full md:w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto flex-shrink-0">
        {Object.entries(formElementTypes).map(([group, elements]) => (
            <div key={group} className="mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">{group}</h3>
                 {elements.map((el) => (<div key={el.type} draggable onDragStart={(e) => handleDragStart(e, el)} className="flex items-center gap-3 p-2.5 rounded-lg cursor-grab active:cursor-grabbing hover:bg-gray-100 transition-all"><el.icon className="w-5 h-5 text-gray-500" /><span className="text-sm font-medium text-gray-700">{el.label}</span></div>))}
            </div>
        ))}
      </div>
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <input type="text" value={calculatorName} onChange={(e) => setCalculatorName(e.target.value)} className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none focus:bg-white rounded p-1 -m-1" />
              <input type="text" value={calculatorDescription} onChange={(e) => setCalculatorDescription(e.target.value)} className="text-gray-600 bg-transparent focus:outline-none focus:bg-white rounded p-1 -m-1 w-full mt-1" placeholder="Calculator description..."/>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowSaveModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-sm"><Save className="w-4 h-4" />Save</button>
              <button onClick={() => setActiveTab('preview')} className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 font-semibold text-sm"><Eye className="w-4 h-4" />Preview</button>
            </div>
          </div>
          <div onDragOver={(e) => handleDragOver(e, null)} onDrop={(e) => handleDrop(e, null)} onDragLeave={() => setDropTarget(null)} className={`min-h-[500px] bg-white rounded-xl border-2 p-2 md:p-6 space-y-2 ${formElements.length === 0 ? 'border-dashed border-gray-300 flex items-center justify-center' : 'border-solid border-gray-200'} ${dropTarget === null && draggedElement ? 'bg-indigo-50' : ''}`}>
            {formElements.length === 0 ? (<div className="text-center text-gray-500"><Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" /><h4>Drag elements here</h4></div>) : (
              formElements.map((el) => renderFormElement(el, false, null))
            )}
          </div>
        </div>
      </div>
      {selectedElement && (<div className="w-full md:w-80 bg-white border-l border-gray-200 p-5 overflow-y-auto absolute md:static top-0 right-0 h-full md:h-auto z-20">
        <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-semibold text-gray-900">Properties</h3><button onClick={()=> setSelectedElement(null)} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5"/></button></div>
        {(() => {
          const findElement = (elements, id) => {
              for (const el of elements) {
                  if (el.id === id) return el;
                  if (el.children) {
                      const found = findElement(el.children, id);
                      if (found) return found;
                  }
              }
              return null;
          }
          const el = findElement(formElements, selectedElement);
          if (!el) return null;
          const update = (key, value) => handleUpdateElement(el.id, key, value);
          const updateOption = (idx, key, value) => { const newOpts = [...el.options]; newOpts[idx][key] = value; update('options', newOpts); };
          const addOption = () => update('options', [...el.options, {label: `New Option`, value: `new-option-${Date.now()}`, cost: 0, imageUrl: null}]);
          const removeOption = (idx) => update('options', el.options.filter((_, i) => i !== idx));
          return (<div className="space-y-4 text-sm">
              <div><label className="font-medium">Label</label><input type="text" className="w-full mt-1 p-2 border rounded-md" value={el.label} onChange={e => update('label', e.target.value)} /></div>
              {el.type === 'validated-input' && <div><label className="font-medium">Validation Type</label><select className="w-full mt-1 p-2 border rounded-md" value={el.validationType} onChange={e=>update('validationType', e.target.value)}><option value="text">Text</option><option value="email">Email</option><option value="tel">Phone</option></select></div>}
              {el.type === 'slider' && (<><div><label className="font-medium">Min</label><input type="number" className="w-full mt-1 p-2 border rounded-md" value={el.min} onChange={e => update('min', parseFloat(e.target.value))} /></div><div><label className="font-medium">Max</label><input type="number" className="w-full mt-1 p-2 border rounded-md" value={el.max} onChange={e => update('max', parseFloat(e.target.value))} /></div><div><label className="font-medium">Step</label><input type="number" className="w-full mt-1 p-2 border rounded-md" value={el.step} onChange={e => update('step', parseFloat(e.target.value))} /></div><div><label className="font-medium">Price per step</label><input type="number" className="w-full mt-1 p-2 border rounded-md" value={el.cost || 0} onChange={e => update('cost', parseFloat(e.target.value) || 0)} /></div></>)}
              {!['date', 'time', 'slider', 'group', 'section', 'divider', 'pagebreak'].includes(el.type) && (<div><label className="font-medium">Price</label><input type="number" className="w-full mt-1 p-2 border rounded-md" value={el.cost || 0} onChange={e => update('cost', parseFloat(e.target.value) || 0)} /></div>)}
              {['select', 'radio', 'image-select'].includes(el.type) && (<div className="space-y-2">
                <label className="font-medium">Options</label>
                {el.options.map((opt, idx) => (<div key={idx} className="p-2 border rounded-md space-y-2 bg-gray-50">
                    {el.type === 'image-select' && <div><label className="text-xs">Image</label><input type="file" accept="image/*" onChange={(e) => {const file = e.target.files[0]; if(file){const r=new FileReader();r.onload=(ev)=>updateOption(idx,'imageUrl',ev.target.result);r.readAsDataURL(file)}}} className="w-full text-xs"/></div>}
                    <input type="text" placeholder="Label" className="w-full p-1.5 border rounded" value={opt.label} onChange={e => updateOption(idx, 'label', e.target.value)} />
                    <input type="number" placeholder="Cost" className="w-full p-1.5 border rounded" value={opt.cost || 0} onChange={e => updateOption(idx, 'cost', parseFloat(e.target.value) || 0)} />
                    <button onClick={() => removeOption(idx)} className="text-red-500 text-xs">Remove</button>
                </div>))}
                <button onClick={addOption} className="w-full p-2 border-dashed border-2 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-500">+ Add Option</button>
              </div>)}
          </div>)
        })()}
      </div>)}
    </div>
  );
  
  const renderPreviewUI = () => (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 font-sans">
      <div className={`flex-1 p-4 sm:p-8 overflow-y-auto transition-all duration-300 ${previewMode === 'mobile' ? 'max-w-md mx-auto' : 'w-full'}`}>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{calculatorName || 'Cost Calculator'}</h1>
            <p className="text-gray-500">{calculatorDescription || 'Get an instant quote for your project.'}</p>
          </div>
          <div className="p-8 border-t border-gray-100">
            {pages.length > 1 && (<div className="mb-6"><div className="flex justify-between items-center mb-2"><span className="text-sm font-semibold text-gray-500">Step {currentPage + 1} of {pages.length}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}></div></div></div>)}
            <div className="space-y-6">{pages[currentPage]?.map(el => renderFormElement(el, true))}</div>
            {pages.length > 1 && (<div className="flex justify-between pt-6 mt-6 border-t"><button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 font-semibold">Previous</button><button onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} disabled={currentPage >= pages.length - 1} className="px-6 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 font-semibold">Next</button></div>)}
          </div>
      </div>
      </div>
      <div className="w-full md:w-96 flex-shrink-0 p-4 sm:p-8 md:pl-0">
          <div className="bg-white rounded-2xl shadow-lg h-full flex flex-col">
            <div ref={jpgExportRef} className="p-6 bg-white rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
                {getSummaryItems().length > 0 ? (
                  <>
                    <div className="-mx-6 px-6">
                        <div className="space-y-3">
                            {getSummaryItems().map((item, i) => (
                                <div key={i} className="flex justify-between items-start py-3 border-b border-slate-100 last:border-b-0 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-700">{item.label}</span>
                                        {item.description && <div className="text-xs text-slate-500">{item.description}</div>}
                                    </div>
                                    <span className="text-right font-medium text-slate-700">
                                       {item.amount > 0 ? `$${item.amount.toFixed(2)}` : (item.value || '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-200 mt-4">
                      <div className="flex justify-between items-center text-sm font-medium text-slate-500"><span>Subtotal</span><span>${totalCost.toFixed(2)}</span></div>
                      <div className="flex justify-between items-center text-sm font-medium text-slate-500 mt-2"><span>Tax (0%)</span><span>$0.00</span></div>
                      <div className="flex justify-between items-center text-lg font-bold text-slate-800 mt-3"><span>Total</span><span>${totalCost.toFixed(2)}</span></div>
                    </div>
                  </>
                ) : (<div className="text-center py-10 text-gray-500 flex flex-col items-center justify-center h-full"><Calculator className="w-10 h-10 mb-2 text-gray-300" /><span>Your estimate will appear here.</span></div>)}
            </div>
            {getSummaryItems().length > 0 && 
            <div className="p-6 pt-4 mt-auto border-t border-slate-200 space-y-2">
              <button onClick={generatePDF} className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"><Download className="w-4 h-4"/>Download PDF</button>
              <button onClick={generateJPG} className="w-full py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"><ImageIcon className="w-4 h-4"/>Download JPG</button>
            </div>
            }
          </div>
      </div>
    </div>
  );
  
  // #endregion

  // This is the main router for the app
  if (publicCalculator) {
      return <PublicCalculatorView calculator={publicCalculator} brandSettings={brandSettings} />;
  }

  return (
    <div className="h-screen bg-gray-100 font-sans flex text-gray-900 overflow-hidden">
        <div className="w-16 sm:w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-4 flex-shrink-0">
          <button onClick={() => setActiveTab('dashboard')} className={`p-3 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Dashboard"><BarChart3 /></button>
          <button onClick={() => setActiveTab('builder')} className={`p-3 rounded-xl transition-colors ${activeTab === 'builder' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Builder"><Settings /></button>
          <button onClick={() => setActiveTab('preview')} className={`p-3 rounded-xl transition-colors ${activeTab === 'preview' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'}`} title="Preview"><Eye /></button>
           <button onClick={() => setShowBrandSettings(true)} className={`p-3 rounded-xl transition-colors mt-auto text-gray-500 hover:bg-gray-100`} title="Brand Settings"><Palette /></button>
        </div>
        <div className="flex-1 h-screen overflow-y-auto">
            {activeTab === 'builder' ? renderBuilderUI() : activeTab === 'preview' ? renderPreviewUI() : renderDashboardUI()}
        </div>
        {/* Modals */}
        {showSaveModal && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-lg font-semibold mb-4">Save Calculator</h3><div className="space-y-3"><input type="text" placeholder="Calculator Name" className="w-full p-2 border rounded-md" value={calculatorName} onChange={e => setCalculatorName(e.target.value)} /><textarea placeholder="Description (optional)" className="w-full p-2 border rounded-md h-20" value={calculatorDescription} onChange={e => setCalculatorDescription(e.target.value)}></textarea></div><div className="mt-4 flex gap-2"><button onClick={() => setShowSaveModal(false)} className="flex-1 p-2 bg-gray-200 rounded-md">Cancel</button><button onClick={saveCalculator} className="flex-1 p-2 bg-indigo-600 text-white rounded-md">Save</button></div></div></div>}
        {showShareLinkModal && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-lg font-semibold mb-4">Share Link for "{showShareLinkModal.name}"</h3><div className="flex gap-2"><input type="text" readOnly value={`http://cost-calculator-app.vercel.app/calc/${showShareLinkModal.id}`} className="flex-1 p-2 border rounded-md bg-gray-100" /><button onClick={() => copyToClipboard(`http://cost-calculator-app.vercel.app/calc/${showShareLinkModal.id}`)} className="p-2 bg-indigo-600 text-white rounded-md"><Copy/></button></div><button onClick={() => setShowShareLinkModal(null)} className="w-full mt-4 p-2 bg-gray-200 rounded-md">Close</button></div></div>}
        {showBrandSettings && <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-xl p-6 w-full max-w-md"><h3 className="text-lg font-semibold mb-4">Brand Settings</h3><div className="space-y-4"><input type="text" placeholder="Company Name" className="w-full p-2 border rounded" value={brandSettings.companyName} onChange={e=>setBrandSettings(p=>({...p, companyName:e.target.value}))}/><div><label className="text-sm font-medium">Company Logo</label><input type="file" accept="image/*" onChange={(e) => {const file = e.target.files[0]; if(file){const r=new FileReader();r.onload=(ev)=>setBrandSettings(p=>({...p, companyLogo:ev.target.result}));r.readAsDataURL(file)}}} className="w-full mt-1 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/></div><div className="flex gap-4 items-center"><label>Primary Color</label><input type="color" value={brandSettings.primaryColor} onChange={e=>setBrandSettings(p=>({...p, primaryColor:e.target.value}))} className="w-10 h-10"/></div><div className="flex gap-4 items-center"><label>Secondary Color</label><input type="color" value={brandSettings.secondaryColor} onChange={e=>setBrandSettings(p=>({...p, secondaryColor:e.target.value}))} className="w-10 h-10"/></div></div><button onClick={() => setShowBrandSettings(false)} className="w-full mt-6 p-2 bg-indigo-600 text-white rounded-md">Done</button></div></div>}

    </div>
  );
};

export default CostCalculatorApp;
