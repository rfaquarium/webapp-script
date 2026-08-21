    function GHNPushModal({ order, prods, onClose, pushDeltas, triggerToast, showCopyModal }) {
        const [apiToken, setApiToken] = React.useState("5c588da0-1d0a-11ef-b3d7-824e1db0c320");
        const [shopId, setShopId] = React.useState("5478054");

        const [loading, setLoading] = React.useState(true);
        const [submitting, setSubmitting] = React.useState(false);

        const [shops, setShops] = React.useState([]);

        const [provinces, setProvinces] = React.useState([]);
        const [districts, setDistricts] = React.useState([]);
        const [wards, setWards] = React.useState([]);
        const [availableServices, setAvailableServices] = React.useState([]);

        const [selectedProv, setSelectedProv] = React.useState("");
        const [selectedDist, setSelectedDist] = React.useState("");
        const [selectedWard, setSelectedWard] = React.useState("");
        const [selectedService, setSelectedService] = React.useState("");

        const [finalAddress, setFinalAddress] = React.useState(order.address || "");

        const [formData, setFormData] = React.useState({
            weight: 200,
            length: 10,
            width: 10,
            height: 10,
            cod: Math.max(0, order.cod !== undefined ? order.cod : (Number(order.revenue || order.total || 0) - Number(order.discount || 0) + Number(order.shippingFee || 0) - Number(order.prePaid || order.deposit || 0))),
            insurance: Math.min(5000000, Number(order.revenue || order.total || 0)),
            noteCode: "CHOTHUHANG",
            paymentTypeId: 2
        });

        const norm = (str) => {
            if (!str) return "";
            return String(str).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "");
        };

        const formatPhone = (p) => {
            let s = String(p || '').replace(/[^0-9]/g, '');
            if (s && !s.startsWith('0')) return '0' + s;
            return s;
        };
        const customerPhone = formatPhone(order.phone);

        const fetchDistricts = async (provId, headers) => {
            if (!provId) { setDistricts([]); setWards([]); setSelectedDist(""); setSelectedWard(""); setAvailableServices([]); setSelectedService(""); return; }
            try {
                const res = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${provId}`, { headers: headers });
                const data = await res.json();
                setDistricts(data.data || []);
                setWards([]); setSelectedDist(""); setSelectedWard("");
                setAvailableServices([]); setSelectedService("");
            } catch (e) { }
        };

        const fetchWards = async (distId, headers) => {
            if (!distId) { setWards([]); setSelectedWard(""); setAvailableServices([]); setSelectedService(""); return; }
            try {
                const res = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${distId}`, { headers: headers });
                const data = await res.json();
                setWards(data.data || []);
                setSelectedWard("");
            } catch (e) { }
            
            // Lấy danh sách dịch vụ luôn khi có Quận
            fetchServices(distId, shopId, apiToken);
        };

        const fetchServices = async (toDistId, currentShopId, currentToken) => {
            if (!toDistId) return;
            try {
                const res = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Token": currentToken },
                    body: JSON.stringify({ shop_id: Number(currentShopId), from_district: 1704, to_district: Number(toDistId) })
                });
                const data = await res.json();
                if (data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
                    setAvailableServices(data.data);
                    setSelectedService(String(data.data[0].service_id || data.data[0].service_type_id));
                } else {
                    setAvailableServices([]); setSelectedService("");
                }
            } catch (e) { console.error(e); }
        };

        React.useEffect(() => {
            if (!selectedProv || !selectedDist || !selectedWard) return;
            const pName = provinces.find(p => String(p.ProvinceID) === String(selectedProv))?.ProvinceName || "";
            const dName = districts.find(d => String(d.DistrictID) === String(selectedDist))?.DistrictName || "";
            const wName = wards.find(w => String(w.WardCode) === String(selectedWard))?.WardName || "";

            let parts = String(order.address || "").split(',');
            let street = parts[0];
            if (parts.length > 3) {
                street = parts.slice(0, parts.length - 3).join(',').trim();
            } else if (parts.length > 1) {
                street = parts[0].trim();
            } else {
                street = order.address.trim();
            }

            const generated = `${street}, ${wName}, ${dName}, ${pName}`;
            setFinalAddress(generated);
        }, [selectedProv, selectedDist, selectedWard, provinces, districts, wards]);

        React.useEffect(() => {
            const init = async () => {
                try {
                    let configToken = apiToken;
                    let configShopId = shopId;
                    try {
                        const conf = await new Promise((resolve) => {
                            google.script.run.withSuccessHandler(resolve).withFailureHandler(() => resolve(null)).getGHNConfig();
                        });
                        if (conf && conf.token) {
                            configToken = conf.token;
                            configShopId = conf.shopId;
                            setApiToken(configToken);
                            setShopId(configShopId);
                        }
                    } catch (e) { console.error("Lỗi lấy cấu hình GHN:", e); }

                    const headers = { "Content-Type": "application/json", "Token": configToken, "ShopId": configShopId };

                    let sId = configShopId;
                    try {
                        const shopRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shop/all", { headers: headers });
                        const shopData = await shopRes.json();
                        if (shopData.code === 200 && shopData.data && shopData.data.shops) {
                            const targetShop = shopData.data.shops.find(s => String(s._id) === String(sId));
                            setShops(targetShop ? [targetShop] : shopData.data.shops.filter(s => String(s._id) === String(sId)));
                            if (!targetShop) setShops([{ _id: sId, name: sId + " - Richfish Aquarium" }]);
                        } else {
                            setShops([{ _id: sId, name: sId + " - Richfish Aquarium" }]);
                        }
                    } catch (e) { setShops([{ _id: sId, name: sId + " - Richfish Aquarium" }]); }

                    const provRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", { headers: headers });
                    const provData = await provRes.json();
                    let provs = provData.data || [];
                    setProvinces(provs);

                    const addr = String(order.address || "");
                    let matchedProv = null;
                    for (let p of provs) {
                        const pName = norm(p.ProvinceName);
                        const pExt = p.NameExtension ? p.NameExtension.map(e => norm(e)) : [];
                        if (norm(addr).includes(pName) || pExt.some(e => norm(addr).includes(e))) {
                            matchedProv = p; break;
                        }
                    }

                    if (matchedProv) {
                        setSelectedProv(matchedProv.ProvinceID);
                        const distRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${matchedProv.ProvinceID}`, { headers: headers });
                        const distData = await distRes.json();
                        let dists = distData.data || [];
                        setDistricts(dists);

                        let matchedDist = null;
                        for (let d of dists) {
                            const dName = norm(d.DistrictName);
                            const dExt = d.NameExtension ? d.NameExtension.map(e => norm(e)) : [];
                            if (norm(addr).includes(dName) || dExt.some(e => norm(addr).includes(e))) {
                                matchedDist = d; break;
                            }
                        }

                        if (matchedDist) {
                            setSelectedDist(matchedDist.DistrictID);
                            
                            // Load services immediately since we mapped district
                            fetchServices(matchedDist.DistrictID, configShopId, configToken);

                            const wardRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${matchedDist.DistrictID}`, { headers: headers });
                            const wardData = await wardRes.json();
                            let wrds = wardData.data || [];
                            setWards(wrds);

                            let matchedWard = null;
                            for (let w of wrds) {
                                const wName = norm(w.WardName);
                                const wExt = w.NameExtension ? w.NameExtension.map(e => norm(e)) : [];
                                if (norm(addr).includes(wName) || wExt.some(e => norm(addr).includes(e))) {
                                    matchedWard = w; break;
                                }
                            }
                            if (matchedWard) {
                                setSelectedWard(matchedWard.WardCode);
                            }
                        }
                    }
                } catch (e) {
                    console.error(e);
                    triggerToast("Lỗi tải dữ liệu GHN", "fa-exclamation-triangle", "warning");
                }
                setLoading(false);
            };
            init();
        }, []);

        const handleCreate = async () => {
            if (!selectedProv || !selectedDist || !selectedWard) {
                triggerToast("Vui lòng chọn đầy đủ Tỉnh/Quận/Phường!", "fa-exclamation", "warning");
                return;
            }
            if (!selectedService) {
                triggerToast("Không có dịch vụ vận chuyển nào hỗ trợ tuyến đường này!", "fa-times", "danger");
                return;
            }

            setSubmitting(true);
            try {
                let weightTotal = Number(formData.weight) || 200;
                let validItems = prods && prods.length > 0 ? prods.map(p => {
                    let w = Math.floor(weightTotal / prods.length);
                    if (w < 10) w = 10;
                    return {
                        name: String(p.name).substring(0, 50),
                        quantity: Number(p.qty) || 1,
                        weight: w
                    };
                }) : [{ name: "Sản phẩm", quantity: 1, weight: weightTotal < 10 ? 10 : weightTotal }];

                const body = {
                    client_order_code: String(order.id),
                    payment_type_id: Number(formData.paymentTypeId),
                    note: order.note || "Hàng dễ vỡ",
                    required_note: formData.noteCode,
                    to_name: order.customer,
                    to_phone: customerPhone,
                    to_address: finalAddress,
                    to_ward_code: String(selectedWard),
                    to_district_id: Number(selectedDist),
                    cod_amount: Number(formData.cod),
                    weight: weightTotal,
                    length: Number(formData.length) || 10,
                    width: Number(formData.width) || 10,
                    height: Number(formData.height) || 10,
                    insurance_value: Math.min(Number(formData.insurance) || 0, 5000000),
                    service_id: Number(selectedService),
                    items: validItems
                };

                console.log("=== GHN PAYLOAD ===", JSON.stringify(body));
                const h = { "Content-Type": "application/json", "Token": apiToken, "ShopId": shopId };
                
                let res = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create", {
                    method: "POST", headers: h, body: JSON.stringify(body)
                });
                let data = await res.json();
                console.log("=== GHN RESPONSE ===", JSON.stringify(data));

                if (data.code === 400 && data.message && data.message.toLowerCase().includes("client_order_code")) {
                    // Trùng mã đơn -> lấy mã cũ
                    try {
                        const dr = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/detail", { method: "POST", headers: h, body: JSON.stringify({ client_order_code: body.client_order_code }) });
                        const dd = await dr.json();
                        if (dd.code === 200 && dd.data && dd.data.order_code) {
                            data = dd;
                        } else {
                            body.client_order_code = String(order.id) + "_" + Date.now().toString().slice(-4);
                            res = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create", { method: "POST", headers: h, body: JSON.stringify(body) });
                            data = await res.json();
                        }
                    } catch (_) {}
                }

                if (data.code === 200 && data.data && data.data.order_code) {
                    let newOrderCode = order.orderCode || '';
                    if (newOrderCode.includes(' | MVĐ: ')) newOrderCode = newOrderCode.split(' | MVĐ: ')[0];
                    else if (newOrderCode.includes('|MVĐ:')) newOrderCode = newOrderCode.split('|MVĐ:')[0];
                    newOrderCode = newOrderCode + ' | MVĐ: ' + data.data.order_code;

                    const updatedOrder = { ...order, orderCode: newOrderCode, shippingCode: data.data.order_code, cod: Number(formData.cod) };
                    pushDeltas({ orders: [updatedOrder] }, `Tạo đơn GHN thành công! Vận đơn: ${data.data.order_code}`, "fa-check").then(() => {
                        if (typeof showCopyModal === 'function') {
                            const msg = `Dạ Rich Fish Aquarium gửi anh/chị mã vận đơn GHN: ${data.data.order_code}. Anh/chị theo dõi hành trình đơn hàng trên app giúp shop nhé!`;
                            showCopyModal(msg);
                        }
                    }).catch(() => { });
                    onClose();
                } else {
                    throw new Error(data.message || data.code_message_value || "Tạo đơn thất bại");
                }
            } catch (e) {
                console.error(e);
                triggerToast(e.message || "Lỗi khi đẩy đơn sang GHN!", "fa-times", "danger");
            }
            setSubmitting(false);
        };

        if (loading) return (
            <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
                <div className="bg-[#141414] border border-[#333] p-8 rounded-2xl flex flex-col items-center gap-4">
                    <i className="fas fa-spinner fa-spin text-orange-500 text-3xl"></i>
                    <div className="text-white font-bold text-sm">Đang đọc hiểu địa chỉ & kết nối GHN...</div>
                </div>
            </div>
        );

        return (
            <div className="fixed inset-0 z-[999] bg-black/85 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in" onClick={onClose}>
                <div className="bg-[#18181b] w-full max-w-lg rounded-[24px] border border-[#333] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slide-up" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-[#27272a] bg-gradient-to-r from-orange-900/40 to-[#18181b] flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                                <i className="fas fa-truck text-orange-500 text-sm"></i>
                            </div>
                            <div>
                                <h3 className="font-black text-[14px] text-white uppercase tracking-widest leading-tight">Đẩy Đơn GHN</h3>
                                <div className="text-[10px] text-gray-400 font-bold">Xác nhận tạo đơn nhanh</div>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#27272a] text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                        <div className="bg-[#111] border border-[#222] p-4 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-[100%]"></div>
                            <div className="text-[10px] font-black text-orange-500 mb-2 uppercase tracking-widest"><i className="fas fa-user mr-1"></i> Thông tin Người Nhận</div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold block mb-1">Họ tên</label>
                                    <div className="text-[12px] text-white font-bold">{order.customer}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] text-gray-500 font-bold block mb-1">Số điện thoại</label>
                                    <div className="text-[12px] text-white font-bold">{customerPhone}</div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] text-gray-500 font-bold block mb-1">Địa chỉ đồng bộ GHN (Tự động theo chuẩn mới)</label>
                                <input value={finalAddress} onChange={e => setFinalAddress(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2 text-[11px] font-bold text-white outline-none focus:border-orange-500" />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-map-marker-alt"></i> Phân tích địa chỉ GHN
                                {selectedWard && selectedDist && selectedProv && <span className="text-emerald-500"><i className="fas fa-check-circle"></i> Tự động khớp</span>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <select value={selectedProv} onChange={e => { setSelectedProv(e.target.value); fetchDistricts(e.target.value, { "Content-Type": "application/json", "Token": apiToken, "ShopId": shopId }); }} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2 text-[11px] font-bold text-white outline-none focus:border-orange-500">
                                    <option value="">- Chọn Tỉnh/Thành -</option>
                                    {provinces.map(p => <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>)}
                                </select>
                                <select value={selectedDist} onChange={e => { setSelectedDist(e.target.value); fetchWards(e.target.value, { "Content-Type": "application/json", "Token": apiToken, "ShopId": shopId }); }} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2 text-[11px] font-bold text-white outline-none focus:border-orange-500" disabled={!selectedProv}>
                                    <option value="">- Chọn Quận/Huyện -</option>
                                    {districts.map(d => <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>)}
                                </select>
                                <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2 text-[11px] font-bold text-white outline-none focus:border-orange-500" disabled={!selectedDist}>
                                    <option value="">- Chọn Phường/Xã -</option>
                                    {wards.map(w => <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <i className="fas fa-box-open"></i> Cấu hình kiện hàng
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Cửa hàng (ShopId)</label>
                                    <select value={shopId} onChange={e => { setShopId(e.target.value); if(selectedDist) fetchServices(selectedDist, e.target.value, apiToken); }} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2.5 text-[12px] font-bold text-white outline-none focus:border-orange-500">
                                        {shops.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Người trả phí Ship</label>
                                    <select value={formData.paymentTypeId} onChange={e => setFormData({ ...formData, paymentTypeId: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2.5 text-[12px] font-bold text-white outline-none focus:border-orange-500">
                                        <option value={1}>Shop trả (Người gửi)</option>
                                        <option value={2}>Khách trả (Người nhận)</option>
                                    </select>
                                </div>
                                <div className="col-span-2 bg-[#121214] border border-orange-500/30 rounded-xl p-3">
                                    <label className="text-[10px] text-orange-400 font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5"><i className="fas fa-shipping-fast text-orange-500"></i> Gói cước GHN</label>
                                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full bg-[#18181b] border border-orange-500/40 rounded-lg px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-orange-500">
                                        {availableServices.length > 0 ? availableServices.map(s => <option key={s.service_id || s.service_type_id} value={s.service_id || s.service_type_id}>{s.short_name || 'Giao Hàng Nhanh'}</option>) : <option value="">Đang tìm dịch vụ khả dụng...</option>}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Trọng lượng (gram)</label>
                                    <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-3 py-2.5 text-[12px] font-bold text-white outline-none focus:border-orange-500 text-center" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Kích thước (D-R-C cm)</label>
                                    <div className="flex gap-1">
                                        <input type="number" value={formData.length} onChange={e => setFormData({ ...formData, length: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-1 py-2.5 text-[11px] font-bold text-white outline-none focus:border-orange-500 text-center" />
                                        <input type="number" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-1 py-2.5 text-[11px] font-bold text-white outline-none focus:border-orange-500 text-center" />
                                        <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-1 py-2.5 text-[11px] font-bold text-white outline-none focus:border-orange-500 text-center" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] text-emerald-500 font-bold block mb-1">Tiền Thu Hộ (COD)</label>
                                    <input type="number" value={formData.cod} onChange={e => setFormData({ ...formData, cod: e.target.value })} className="w-full bg-[#111] border border-emerald-500/50 rounded-lg px-3 py-2.5 text-[13px] font-black text-emerald-400 outline-none focus:border-emerald-500 text-center shadow-[0_0_10px_rgba(16,185,129,0.1)]" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Ghi chú bắt buộc</label>
                                    <select value={formData.noteCode} onChange={e => setFormData({ ...formData, noteCode: e.target.value })} className="w-full bg-[#111] border border-[#333] rounded-lg px-2 py-2.5 text-[11px] font-bold text-white outline-none focus:border-orange-500">
                                        <option value="CHOTHUHANG">Cho thử hàng</option>
                                        <option value="CHOXEMHANGKHONGTHU">Cho xem hàng, ko thử</option>
                                        <option value="KHONGCHOXEMHANG">Không cho xem hàng</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-[#27272a] bg-[#18181b] shrink-0">
                        <button onClick={handleCreate} disabled={submitting} className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black rounded-xl shadow-lg shadow-orange-950/30 active:scale-95 transition-all text-center uppercase tracking-wider flex items-center justify-center gap-2">
                            {submitting ? <><i className="fas fa-spinner fa-spin"></i> ĐANG ĐẨY ĐƠN GHN...</> : <><i className="fas fa-paper-plane"></i> XÁC NHẬN TẠO ĐƠN GHN</>}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
