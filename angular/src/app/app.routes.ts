import { Routes } from '@angular/router';
import { BookingFormComponent } from './booking-form/booking-form.component';
import { BookingListComponent } from './booking-list/booking-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RoomsComponent } from './rooms/rooms.component';
import { RoomFormComponent } from './rooms/room-form/room-form';
import { RoomDetailsComponent } from './rooms/room-details/room-details';
import { SettingsComponent } from './settings/settings.component';
import { ReportsComponent } from './reports/reports.component';
import { MyAccountComponent } from './my-account/my-account.component';
import { RoomPlanComponent } from './front-desk/room-plan/room-plan.component';
import { RoomsRackComponent } from './front-desk/rooms-rack/rooms-rack.component';
import { GuestValuablesComponent } from './front-desk/guest-valuables/guest-valuables.component';
import { KeysComponent } from './front-desk/keys/keys.component';
import { KeyServicesComponent } from './front-desk/key-services/key-services.component';
import { RentPostingComponent } from './cashier/rent-posting/rent-posting.component';
import { PreviousInvoicesComponent } from './cashier/previous-invoices/previous-invoices.component';
import { InvoicesNotificationsComponent } from './cashier/invoices-notifications/invoices-notifications.component';
import { CashierClosingComponent } from './cashier/cashier-closing/cashier-closing.component';
import { ServicesInvoiceComponent } from './cashier/services-invoice/services-invoice.component';
import { CrmProfileSettingsComponent } from './crm/profile-settings/crm-profile-settings.component';
import { CrmIndividualsComponent } from './crm/individuals/crm-individuals.component';
import { CrmCompaniesComponent } from './crm/companies/crm-companies.component';
import { CrmAgentsComponent } from './crm/agents/crm-agents.component';
import { CrmBlacklistComponent } from './crm/blacklist/crm-blacklist.component';
import { CrmRepresentativesComponent } from './crm/representatives/crm-representatives.component';
import { NightAuditSettingsComponent } from './night-auditor/night-audit-settings/night-audit-settings.component';
import { NightAuditReservationsComponent } from './night-auditor/reservations-review/night-audit-reservations.component';
import { NightAuditProcedureComponent } from './night-auditor/procedure/night-audit-procedure.component';
import { NightAuditRoomMovementComponent } from './night-auditor/room-movement/night-audit-room-movement.component';
import { NightAuditInquiriesComponent } from './night-auditor/inquiries/night-audit-inquiries.component';
import { HkTasksComponent } from './housekeeping/hk-tasks/hk-tasks.component';
import { HkTaskRequestComponent } from './housekeeping/hk-task-request/hk-task-request.component';
import { HkRoomConflictsComponent } from './housekeeping/hk-room-conflicts/hk-room-conflicts.component';
import { HkTaskRequestsComponent } from './housekeeping/hk-task-requests/hk-task-requests.component';
import { HkCheckRoomStatusComponent } from './housekeeping/hk-check-room-status/hk-check-room-status.component';
import { HkMaintenanceRequestsComponent } from './housekeeping/hk-maintenance-requests/hk-maintenance-requests.component';
import { HkRoomInspectionItemsComponent } from './housekeeping/hk-room-inspection-items/hk-room-inspection-items.component';
import { HkRoomInspectionOpsComponent } from './housekeeping/hk-room-inspection-ops/hk-room-inspection-ops.component';
import { NavPlaceholderComponent } from './navigation/nav-placeholder.component';
import { GroupBookingComponent } from './bookings/group-booking/group-booking.component';
import { RevenueCardComponent } from './bookings/revenue-card/revenue-card.component';
import { GroupsListComponent } from './bookings/groups-list/groups-list.component';
import { BookingsChartComponent } from './bookings/bookings-chart/bookings-chart.component';
import { RoomsScheduleComponent } from './bookings/rooms-schedule/rooms-schedule.component';
import { AvailabilityChartComponent } from './bookings/availability-chart/availability-chart.component';
import { BookingsInquiriesComponent } from './bookings/bookings-inquiries/bookings-inquiries.component';
import { ResidentGuestsDataComponent } from './bookings/resident-guests-data/resident-guests-data.component';
import { ArAccountsComponent } from './accounts/ar-accounts/ar-accounts.component';
import { AccountsReceivableComponent } from './accounts/accounts-receivable/accounts-receivable.component';
import { AgentAccountsComponent } from './accounts/agent-accounts/agent-accounts.component';
import { OpeningBalancesComponent } from './accounts/opening-balances/opening-balances.component';
import { ChartOfAccountsLinkComponent } from './accounts/chart-of-accounts-link/chart-of-accounts-link.component';
import { AccountingEntriesComponent } from './accounts/accounting-entries/accounting-entries.component';
import { TranslationGuideComponent } from './welcome/translation-guide.component';
import { authGuard } from './guards/auth.guard';
import { inlineTranslationNavGuard } from './guards/inline-translation-nav.guard';
import { welcomeEntryGuard } from './guards/welcome-entry.guard';

const protectedRoute = [authGuard, inlineTranslationNavGuard];

export const appRoutes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [welcomeEntryGuard], children: [] },
  { path: 'welcome', component: TranslationGuideComponent, canActivate: protectedRoute },
  { path: 'dashboard', component: DashboardComponent, canActivate: protectedRoute },
  { path: 'bookings', component: BookingListComponent, canActivate: protectedRoute },
  { path: 'front-desk/booking', component: BookingFormComponent, canActivate: protectedRoute },
  { path: 'front-desk/room-plan', component: RoomPlanComponent, canActivate: protectedRoute },
  { path: 'front-desk/rooms-rack', component: RoomsRackComponent, canActivate: protectedRoute },
  { path: 'front-desk/guest-valuables', component: GuestValuablesComponent, canActivate: protectedRoute },
  { path: 'front-desk/keys', component: KeysComponent, canActivate: protectedRoute },
  { path: 'front-desk/key-services', component: KeyServicesComponent, canActivate: protectedRoute },
  { path: 'cashier/rent-posting', component: RentPostingComponent, canActivate: protectedRoute },
  { path: 'cashier/previous-invoices', component: PreviousInvoicesComponent, canActivate: protectedRoute },
  { path: 'cashier/invoices-notifications', component: InvoicesNotificationsComponent, canActivate: protectedRoute },
  { path: 'crm/profile-settings', component: CrmProfileSettingsComponent, canActivate: protectedRoute },
  { path: 'crm/individuals', component: CrmIndividualsComponent, canActivate: protectedRoute },
  { path: 'crm/companies', component: CrmCompaniesComponent, canActivate: protectedRoute },
  { path: 'crm/agents', component: CrmAgentsComponent, canActivate: protectedRoute },
  { path: 'night-auditor/settings', component: NightAuditSettingsComponent, canActivate: protectedRoute },
  { path: 'night-auditor/reservations-review', component: NightAuditReservationsComponent, canActivate: protectedRoute },
  { path: 'night-auditor/procedure', component: NightAuditProcedureComponent, canActivate: protectedRoute },
  { path: 'night-auditor/room-movement', component: NightAuditRoomMovementComponent, canActivate: protectedRoute },
  { path: 'front-desk', component: BookingListComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navGroupBooking', component: GroupBookingComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navRevenueCard', component: RevenueCardComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navGroups', component: GroupsListComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navBookingsChart', component: BookingsChartComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navRoomsSchedule', component: RoomsScheduleComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navAvailabilityChart', component: AvailabilityChartComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navBookingsInquiries', component: BookingsInquiriesComponent, canActivate: protectedRoute },
  { path: 'nav/bookings/navResidentGuestsData', component: ResidentGuestsDataComponent, canActivate: protectedRoute },
  { path: 'nav/cashier/navCashierClosing', component: CashierClosingComponent, canActivate: protectedRoute },
  { path: 'nav/cashier/navServicesInvoice', component: ServicesInvoiceComponent, canActivate: protectedRoute },
  { path: 'nav/crm/navCrmBlacklist', component: CrmBlacklistComponent, canActivate: protectedRoute },
  { path: 'nav/crm/navCrmRepresentatives', component: CrmRepresentativesComponent, canActivate: protectedRoute },
  { path: 'nav/nightAuditor/navNightAuditInquiries', component: NightAuditInquiriesComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkTasks', component: HkTasksComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkTaskRequest', component: HkTaskRequestComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkTaskRequests', component: HkTaskRequestsComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkCheckRoomStatus', component: HkCheckRoomStatusComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkMaintenanceRequests', component: HkMaintenanceRequestsComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkRoomInspectionItems', component: HkRoomInspectionItemsComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkRoomInspectionOps', component: HkRoomInspectionOpsComponent, canActivate: protectedRoute },
  { path: 'nav/housekeeping/navHkRoomConflicts', component: HkRoomConflictsComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navDebitAccounts', component: ArAccountsComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navAccountsReceivable', component: AccountsReceivableComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navAgentAccounts', component: AgentAccountsComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navOpeningBalances', component: OpeningBalancesComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navChartOfAccountsLink', component: ChartOfAccountsLinkComponent, canActivate: protectedRoute },
  { path: 'nav/accounts/navAccountingEntries', component: AccountingEntriesComponent, canActivate: protectedRoute },
  { path: 'nav/:section/:itemKey', component: NavPlaceholderComponent, canActivate: protectedRoute },
  { path: 'rooms', component: RoomsComponent, canActivate: protectedRoute },
  { path: 'rooms/add', component: RoomFormComponent, canActivate: protectedRoute },
  { path: 'rooms/edit/:id', component: RoomFormComponent, canActivate: protectedRoute },
  { path: 'rooms/details/:id', component: RoomDetailsComponent, canActivate: protectedRoute },
  { path: 'reports', component: ReportsComponent, canActivate: protectedRoute },
  { path: 'settings', component: SettingsComponent, canActivate: protectedRoute },
  { path: 'account/manage', component: MyAccountComponent, canActivate: protectedRoute },
  { path: 'my-account', component: MyAccountComponent, canActivate: protectedRoute },
];
