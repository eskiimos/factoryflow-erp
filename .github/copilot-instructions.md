# FactoryFlow ERP - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a **FactoryFlow ERP** - Complete Production Management System MVP 0.1 built with:
- Next.js 15 (App Router) with React 18 and TypeScript
- SQLite database with Prisma ORM
- shadcn/ui components with Tailwind CSS
- Bento Grid layout design system
- Complete product lifecycle management with cost calculation
- Intelligent pricing system with margin recommendations
- Step-by-step guided workflow for product creation
- Dashboard with KPI cards and Recharts visualizations

## ⚠️ ВАЖНО: Функционал калькулятора недоступен
**ВНИМАНИЕ**: Функционал под путями `/calculator/component`, `/calculator` и `/calculator/linear` находится в разработке и не должен использоваться до особого уведомления. Дополнительная информация в файле `.github/copilot-calculator-instructions.md`.

## Architecture Guidelines
- Use App Router for all pages and API routes
- Implement soft delete pattern with `isActive` field
- Follow Bento Grid design system with light theme only
- Use TypeScript strictly with proper type definitions
- Implement proper error handling and loading states
- Use Prisma for all database operations
- Follow REST API patterns for endpoints
- Step-by-step workflow design for complex forms
- Intelligent pricing with automatic margin calculation

## Product Management System Structure
The main product editing interface (`/src/components/edit-product-page.tsx`) follows a 6-step workflow:

### Step 1: Основное (Basic Information)
- **Purpose**: Essential product details and visual presentation
- **Components**: Product name, description, unit, category selection, image upload
- **Key Features**: 
  - Two-column layout: info (left) + image upload (right)
  - Image upload with drag-drop, hover effects, conversion tips
  - Category management with dynamic dropdown
- **Business Logic**: Foundation data that defines the product identity

### Step 2: Материалы (Materials & Components)
- **Purpose**: Raw materials and components cost calculation
- **Components**: Material selection, quantity input, cost calculation
- **Key Features**:
  - Add materials with quantities and prices
  - Real-time cost calculation per unit
  - Material management with CRUD operations
  - Integration with materials database
- **Business Logic**: Direct materials cost contributing to product cost

### Step 3: Работы (Work Types & Labor)
- **Purpose**: Labor costs and production time tracking
- **Components**: Work type selection, time input, rate calculation
- **Key Features**:
  - Add work types with hourly rates and time estimates
  - Production time accumulation (affects pricing recommendations)
  - Work type management with CRUD operations
- **Business Logic**: Labor costs and time estimates for production planning

### Step 4: Фонды (Fund Usage & Overhead)
- **Purpose**: Overhead costs and fund allocation
- **Components**: Fund selection, allocation percentages, overhead calculation
- **Key Features**:
  - Fund allocation with percentage-based distribution
  - Overhead cost calculation
  - Fund management with category-based organization
- **Business Logic**: Indirect costs that need to be allocated to products

### Step 5: Ценообразование (Pricing & Profitability)
- **Purpose**: Intelligent pricing with margin analysis
- **Components**: Cost summary, margin calculation, price recommendations
- **Key Features**:
  - Automatic price calculation based on total costs
  - Quick margin buttons (15%, 20%, 25%, 30%)
  - Profitability analysis with visual indicators
  - Business recommendations based on margin levels
  - Real-time profit calculations and time-based metrics
- **Business Logic**: Final pricing strategy with competitive analysis

### Step 6: Настройки (Production Settings)
- **Purpose**: Production parameters and inventory management
- **Components**: Production time display, workflow settings, stock levels
- **Key Features**:
  - Production time breakdown (days/hours/minutes)
  - Inventory management (current/min/max stock)
  - Workflow automation settings
  - Product status management
- **Business Logic**: Operational parameters for production planning

## Design System - Bento-Light
- **Colors**: Background #F8FAFC, Card #FFFFFF, Primary #2563EB → #3B82F6 gradient
- **Grid**: 24px gap, rounded-2xl, shadow-lg/10
- **Icons**: Lucide React icons with 1.5px stroke
- **Cards**: 1×1, 2×1, 2×2 tiles with stagger animation
- **Accessibility**: 4.5+ contrast ratio, proper ARIA labels

## Code Style
- Use functional components with hooks
- Implement proper loading and error states
- Use TypeScript interfaces for all data structures
- Follow shadcn/ui patterns for components
- Use proper SEO meta tags and OpenGraph
- Implement proper form validation with react-hook-form

## Database Schema
### Core Models
- **Product**: id, name, description, unit, sellingPrice, categoryId, isActive, currentStock, minStock, maxStock
- **MaterialUsage**: id, productId, materialId, quantity (links products to materials)
- **WorkTypeUsage**: id, productId, workTypeId, estimatedTime (links products to work types)
- **ProductFundUsage**: id, productId, fundId, allocationPercentage (links products to funds)
- **MaterialItem**: id, name, unit, price, currency, isActive, categoryId
- **WorkType**: id, name, description, hourlyRate, departmentId, isActive
- **Fund**: id, name, description, totalAmount, categoryId, isActive
- **Category**: id, name, description, isActive (universal category system)
- **Department**: id, name, description, isActive
- **Employee**: id, name, email, position, departmentId, isActive

### Key Relationships
- Products can use multiple materials, work types, and funds
- All entities use soft delete pattern with `isActive` field
- Categories are shared across materials, products, and funds
- Departments organize work types and employees
- Cost calculation aggregates across all usage tables

## API Endpoints Structure
### Product Management
- `GET /api/products` - List all products with pagination
- `GET /api/products/[id]` - Get single product with all usage data
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Soft delete product

### Materials, Work Types, Funds
- Standard CRUD operations for each entity type
- Usage endpoints for linking to products
- Category-based filtering and organization

## Key Features Implementation Guide
### 1. Step-by-Step Product Creation Workflow
- **Location**: `/src/components/edit-product-page.tsx`
- **Pattern**: Tabbed interface with numbered steps (1-6)
- **Navigation**: Each tab has clear purpose and validation
- **State Management**: Single form state with real-time calculations

### 2. Intelligent Cost Calculation System
- **Materials Cost**: Sum of (material.price × usage.quantity)
- **Labor Cost**: Sum of (workType.hourlyRate × usage.estimatedTime)  
- **Overhead Cost**: Sum of (fund.totalAmount × usage.allocationPercentage / 100)
- **Total Cost**: Materials + Labor + Overhead
- **Production Time**: Sum of all work type estimated times

### 3. Dynamic Pricing Recommendations
- **Auto-calculation**: Based on total cost + desired margin
- **Quick Margins**: 15%, 20%, 25%, 30% buttons for instant pricing
- **Profitability Analysis**: Real-time profit/loss calculations
- **Business Intelligence**: Recommendations based on margin levels
- **Time-based Metrics**: Profit per hour calculations

### 4. Material/Work Type/Fund Management
- **CRUD Dialogs**: Reusable components for adding entities
- **Real-time Integration**: Immediate availability after creation  
- **Category Organization**: Hierarchical structure for better organization
- **Usage Tracking**: Link any combination to products

### 5. Advanced UI/UX Patterns
- **Bento Grid Layout**: 24px gap, rounded-2xl, shadow-lg/10
- **Loading States**: Skeleton components during data fetch
- **Error Handling**: User-friendly messages and recovery options
- **Form Validation**: Real-time validation with visual feedback
- **Responsive Design**: Mobile-first approach with breakpoint optimization
