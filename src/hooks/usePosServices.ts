import { useState, useEffect, useCallback } from 'react';
import type { Category, MenuItem, TableItem, CartLine, ShiftRecord, RoleType, KitchenTicket, KitchenTicketStatus, VoucherPromo, TenantConfig, UserAccount } from '../types/pos';
import {
  authService,
  catalogService,
  orderService,
  paymentService,
  shiftService,
  analyticsService,
  kitchenService,
  promotionService,
  configService,
  type DashboardKPIsResponse
} from '../services';
import { MockDatabase } from '../services/mocks/mockDatabase';
import { setSimulatedNetworkError } from '../services/mocks/mockRegistry';

export function usePosServices() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Microservices Domain State
  const [role, setRole] = useState<RoleType>('owner');
  const [tenantName, setTenantName] = useState<string>('Warung Makan Ibu Sari');
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  
  // Shift State
  const [shiftOpen, setShiftOpen] = useState<boolean>(true);
  const [shiftOpeningCash, setShiftOpeningCash] = useState<number>(200000);
  const [shiftExpectedCash, setShiftExpectedCash] = useState<number>(540000);
  const [shiftHistory, setShiftHistory] = useState<ShiftRecord[]>([]);

  // Analytics State
  const [kpis, setKpis] = useState<DashboardKPIsResponse | null>(null);

  // Kitchen & Promotion State
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);
  const [promotions, setPromotions] = useState<VoucherPromo[]>([]);

  // Tenant Config State
  const [tenantConfig, setTenantConfig] = useState<TenantConfig>({
    taxRate: 0.11,
    taxEnabled: true,
    taxLabel: 'PPN 11%'
  });

  // E2E DevMode State
  const [devModeOpen, setDevModeOpen] = useState<boolean>(false);
  const [isSimulatedError, setIsSimulatedError] = useState<boolean>(false);

  // Load Initial Data across Microservices
  const refreshAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, tbls, shiftRes, kpiRes, kdsRes, promoRes, cfgRes, usersRes] = await Promise.all([
        catalogService.getCategories(),
        orderService.getTables(),
        shiftService.getCurrentShift(),
        analyticsService.getKPIs('today'),
        kitchenService.getTickets(),
        promotionService.getPromotions(),
        configService.getTenantConfig(),
        authService.getUsers()
      ]);

      setCategories(cats);
      setTables(tbls);
      setShiftOpen(shiftRes.currentShift.open);
      setShiftOpeningCash(shiftRes.currentShift.openingCash);
      setShiftExpectedCash(shiftRes.currentShift.expectedCash);
      setShiftHistory(shiftRes.history);
      setKpis(kpiRes);
      setKitchenTickets(kdsRes);
      setPromotions(promoRes);
      setTenantConfig(cfgRes);
      setUsers(usersRes);
    } catch (err: any) {
      setError(err.message || 'Failed to sync with microservice gateways');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Actions
  const login = async (selectedRole: RoleType) => {
    const session = await authService.login(selectedRole);
    setRole(session.user.role);
    setTenantName(session.tenantName);
    await refreshAllData();
  };

  const signup = async (businessName: string, ownerName: string, email: string) => {
    const session = await authService.signup(businessName, ownerName, email);
    setRole(session.user.role);
    setTenantName(session.tenantName);
    await refreshAllData();
  };

  const logout = () => {
    authService.logout();
  };

  const saveCategory = async (name: string) => {
    await catalogService.saveCategory(name);
    const updatedCats = await catalogService.getCategories();
    setCategories(updatedCats);
  };

  const saveItem = async (item: MenuItem) => {
    await catalogService.saveItem(item);
    const updatedCats = await catalogService.getCategories();
    setCategories(updatedCats);
  };

  const toggleArchiveItem = async (itemId: string) => {
    await catalogService.toggleArchiveItem(itemId);
    const updatedCats = await catalogService.getCategories();
    setCategories(updatedCats);
  };

  const chargeOrder = async (
    items: CartLine[],
    orderType: 'dinein' | 'takeaway',
    tableNumber: number | null,
    discountValue: number,
    discountType: 'pct' | 'rp',
    paymentMethod: 'cash' | 'qris',
    cashTendered: number
  ) => {
    const res = await paymentService.processPayment({
      items,
      orderType,
      tableNumber,
      discountValue,
      discountType,
      paymentMethod,
      cashTendered
    });

    // Refresh tables and shift
    const [updatedTables, updatedShift, updatedKpis, updatedTickets] = await Promise.all([
      orderService.getTables(),
      shiftService.getCurrentShift(),
      analyticsService.getKPIs('today'),
      kitchenService.getTickets()
    ]);

    setTables(updatedTables);
    setShiftExpectedCash(updatedShift.currentShift.expectedCash);
    setShiftOpen(updatedShift.currentShift.open);
    setKpis(updatedKpis);
    setKitchenTickets(updatedTickets);

    return res;
  };

  const openShift = async (opening: number) => {
    const newShift = await shiftService.openShift(opening);
    setShiftOpen(newShift.open);
    setShiftOpeningCash(newShift.openingCash);
    setShiftExpectedCash(newShift.expectedCash);
  };

  const closeShift = async (counted: number, variance: number) => {
    const res = await shiftService.closeShift(counted, variance);
    setShiftOpen(false);
    setShiftHistory(res.history);
  };

  const updateKitchenStatus = async (orderId: string, status: KitchenTicketStatus) => {
    const updated = await kitchenService.updateTicketStatus(orderId, status);
    setKitchenTickets(updated);
  };

  const validateAndApplyPromo = async (code: string, subtotal: number): Promise<VoucherPromo> => {
    return await promotionService.validateCode(code, subtotal);
  };

  // DevMode controls
  const toggleNetworkErrorSimulation = async () => {
    const newVal = !isSimulatedError;
    setIsSimulatedError(newVal);
    setSimulatedNetworkError(newVal);
    await refreshAllData();
  };

  const savePromo = async (promo: VoucherPromo) => {
    try {
      const updated = await promotionService.savePromotion(promo);
      setPromotions(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const togglePromo = async (code: string) => {
    try {
      const updated = await promotionService.togglePromotion(code);
      setPromotions(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deletePromo = async (code: string) => {
    try {
      const updated = await promotionService.deletePromotion(code);
      setPromotions(updated);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateTaxConfig = async (config: Partial<TenantConfig>) => {
    try {
      const updated = await configService.updateTenantConfig(config);
      setTenantConfig(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const addStaff = async (name: string, email: string) => {
    try {
      const updated = await authService.addKasir(name, email);
      setUsers(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteStaff = async (id: string) => {
    try {
      const updated = await authService.deleteUser(id);
      setUsers(updated);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const resetMockDatabase = async () => {
    MockDatabase.reset();
    setIsSimulatedError(false);
    setSimulatedNetworkError(false);
    await refreshAllData();
  };

  return {
    loading,
    error,
    role,
    tenantName,
    tenantConfig,
    users,
    categories,
    tables,
    shiftOpen,
    shiftOpeningCash,
    shiftExpectedCash,
    shiftHistory,
    kpis,
    kitchenTickets,
    promotions,
    devModeOpen,
    isSimulatedError,
    setDevModeOpen,
    login,
    signup,
    logout,
    saveCategory,
    saveItem,
    toggleArchiveItem,
    chargeOrder,
    openShift,
    closeShift,
    updateKitchenStatus,
    validateAndApplyPromo,
    savePromo,
    togglePromo,
    deletePromo,
    updateTaxConfig,
    addStaff,
    deleteStaff,
    toggleNetworkErrorSimulation,
    resetMockDatabase,
    refreshAllData
  };
}
