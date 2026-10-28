--
-- PostgreSQL database dump
--

\restrict EatEopBZHU7HdNmc1qlQuWXEaj2PBu8DInVtMcbaV3bquvo2aQmSCEEbwAfQcq4

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: body_condition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.body_condition AS ENUM (
    'PRISTINE',
    'LIGHT_SCRATCH',
    'DENTED',
    'BENT'
);


ALTER TYPE public.body_condition OWNER TO postgres;

--
-- Name: booking_slot_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.booking_slot_status AS ENUM (
    'RESERVED',
    'ACTIVE',
    'RELEASED',
    'CANCELLED'
);


ALTER TYPE public.booking_slot_status OWNER TO postgres;

--
-- Name: fine_settlement_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fine_settlement_status AS ENUM (
    'UNPAID',
    'DEDUCTED_FROM_DEPOSIT',
    'ADDITIONAL_INVOICE_PAID',
    'WAIVED'
);


ALTER TYPE public.fine_settlement_status OWNER TO postgres;

--
-- Name: fine_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.fine_type AS ENUM (
    'LATE_RETURN',
    'PHYSICAL_DAMAGE',
    'MISSING_ACCESSORY',
    'ICLOUD_LOCKED',
    'OTHER'
);


ALTER TYPE public.fine_type OWNER TO postgres;

--
-- Name: maintenance_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenance_type AS ENUM (
    'BATTERY_REPLACEMENT',
    'SCREEN_REPAIR',
    'BODY_HOUSING',
    'SOFTWARE_RESTORE',
    'ROUTINE_CHECK'
);


ALTER TYPE public.maintenance_type OWNER TO postgres;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'PENDING',
    'WAITING_VERIFICATION',
    'APPROVED',
    'AWAITING_PAYMENT',
    'PAID',
    'PREPARING',
    'READY_FOR_PICKUP',
    'OUT_FOR_DELIVERY',
    'ACTIVE_RENTAL',
    'RETURNED',
    'INSPECTION_PENDING',
    'COMPLETED',
    'CANCELLED',
    'OVERDUE'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_method AS ENUM (
    'BANK_TRANSFER',
    'MANUAL_QRIS',
    'CASH',
    'PAYMENT_GATEWAY'
);


ALTER TYPE public.payment_method OWNER TO postgres;

--
-- Name: payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED'
);


ALTER TYPE public.payment_status OWNER TO postgres;

--
-- Name: payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.payment_type AS ENUM (
    'RENTAL_AND_DEPOSIT',
    'LATE_FINE',
    'DAMAGE_FINE',
    'DEPOSIT_REFUND'
);


ALTER TYPE public.payment_type OWNER TO postgres;

--
-- Name: physical_grade; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.physical_grade AS ENUM (
    'GRADE_A',
    'GRADE_B',
    'GRADE_C'
);


ALTER TYPE public.physical_grade OWNER TO postgres;

--
-- Name: screen_condition; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.screen_condition AS ENUM (
    'GOOD',
    'SCRATCHED',
    'CRACKED',
    'DEAD_PIXEL'
);


ALTER TYPE public.screen_condition OWNER TO postgres;

--
-- Name: unit_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.unit_status AS ENUM (
    'AVAILABLE',
    'BOOKED',
    'IN_RENTAL',
    'UNDER_INSPECTION',
    'MAINTENANCE',
    'LOST',
    'DECOMMISSIONED'
);


ALTER TYPE public.unit_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'CUSTOMER',
    'ADMIN',
    'SUPERADMIN'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    action character varying(100) NOT NULL,
    entity_name character varying(50) NOT NULL,
    entity_id character varying(100) NOT NULL,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(50),
    user_agent character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_audit_logs_action_not_blank CHECK ((length(TRIM(BOTH FROM action)) > 0)),
    CONSTRAINT chk_audit_logs_entity_id_not_blank CHECK ((length(TRIM(BOTH FROM entity_id)) > 0)),
    CONSTRAINT chk_audit_logs_entity_name_not_blank CHECK ((length(TRIM(BOTH FROM entity_name)) > 0)),
    CONSTRAINT chk_audit_logs_new_values_json CHECK (((new_values IS NULL) OR (jsonb_typeof(new_values) = 'object'::text))),
    CONSTRAINT chk_audit_logs_old_values_json CHECK (((old_values IS NULL) OR (jsonb_typeof(old_values) = 'object'::text))),
    CONSTRAINT chk_audit_logs_values_present CHECK (((old_values IS NOT NULL) OR (new_values IS NOT NULL)))
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: customer_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid NOT NULL,
    address_label character varying(50),
    street_address text NOT NULL,
    city character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    postal_code character varying(10) NOT NULL,
    is_primary boolean DEFAULT true NOT NULL
);


ALTER TABLE public.customer_addresses OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name character varying(150) NOT NULL,
    phone_number character varying(25) NOT NULL,
    nik_ktp character varying(20) NOT NULL,
    ktp_image_url character varying(500) NOT NULL,
    selfie_ktp_image_url character varying(500) NOT NULL,
    social_media_link character varying(255),
    is_verified boolean DEFAULT false NOT NULL,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: fines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fines (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    inspection_id uuid,
    fine_type public.fine_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    reason text NOT NULL,
    deducted_from_deposit boolean DEFAULT true NOT NULL,
    settlement_status public.fine_settlement_status DEFAULT 'UNPAID'::public.fine_settlement_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_fines_amount_positive CHECK ((amount > (0)::numeric)),
    CONSTRAINT chk_fines_inspection_required CHECK ((((fine_type = ANY (ARRAY['LATE_RETURN'::public.fine_type, 'ICLOUD_LOCKED'::public.fine_type])) AND (inspection_id IS NULL)) OR ((fine_type = ANY (ARRAY['PHYSICAL_DAMAGE'::public.fine_type, 'MISSING_ACCESSORY'::public.fine_type, 'OTHER'::public.fine_type])) AND (inspection_id IS NOT NULL)))),
    CONSTRAINT chk_fines_reason_not_blank CHECK ((length(TRIM(BOTH FROM reason)) > 0)),
    CONSTRAINT chk_fines_settlement_consistency CHECK ((((settlement_status = 'DEDUCTED_FROM_DEPOSIT'::public.fine_settlement_status) AND (deducted_from_deposit = true)) OR ((settlement_status = 'ADDITIONAL_INVOICE_PAID'::public.fine_settlement_status) AND (deducted_from_deposit = false)) OR (settlement_status = ANY (ARRAY['UNPAID'::public.fine_settlement_status, 'WAIVED'::public.fine_settlement_status]))))
);


ALTER TABLE public.fines OWNER TO postgres;

--
-- Name: iphone_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iphone_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    image_url character varying(500) NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    display_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.iphone_images OWNER TO postgres;

--
-- Name: iphone_models; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iphone_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_name character varying(100) NOT NULL,
    release_year integer,
    screen_size character varying(20),
    processor character varying(50),
    camera_specs text,
    description text,
    is_published boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.iphone_models OWNER TO postgres;

--
-- Name: iphone_units; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iphone_units (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    imei character varying(18) NOT NULL,
    serial_number character varying(50) NOT NULL,
    battery_health integer NOT NULL,
    physical_grade public.physical_grade NOT NULL,
    current_status public.unit_status DEFAULT 'AVAILABLE'::public.unit_status NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.iphone_units OWNER TO postgres;

--
-- Name: iphone_variants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.iphone_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    model_id uuid NOT NULL,
    storage_capacity character varying(20) NOT NULL,
    color_name character varying(50) NOT NULL,
    daily_rate numeric(12,2) NOT NULL,
    weekly_rate numeric(12,2) NOT NULL,
    monthly_rate numeric(12,2) NOT NULL,
    security_deposit_amount numeric(12,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.iphone_variants OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    payment_number character varying(50) NOT NULL,
    payment_type public.payment_type NOT NULL,
    amount numeric(12,2) NOT NULL,
    payment_method public.payment_method NOT NULL,
    proof_image_url character varying(500),
    status public.payment_status DEFAULT 'PENDING'::public.payment_status NOT NULL,
    verified_by_user_id uuid,
    verified_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_payments_amount_positive CHECK ((amount > (0)::numeric)),
    CONSTRAINT chk_payments_proof_url CHECK (((proof_image_url IS NULL) OR ((proof_image_url)::text ~* '^https?://.+'::text))),
    CONSTRAINT chk_payments_verification CHECK ((((status = 'VERIFIED'::public.payment_status) AND (verified_by_user_id IS NOT NULL) AND (verified_at IS NOT NULL)) OR (status = ANY (ARRAY['PENDING'::public.payment_status, 'REJECTED'::public.payment_status]))))
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: rental_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    allocated_unit_id uuid,
    item_daily_price numeric(12,2) NOT NULL,
    item_subtotal numeric(12,2) NOT NULL,
    CONSTRAINT chk_rental_items_amounts CHECK (((item_daily_price >= (0)::numeric) AND (item_subtotal >= (0)::numeric)))
);


ALTER TABLE public.rental_items OWNER TO postgres;

--
-- Name: rental_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rental_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_number character varying(30) NOT NULL,
    customer_id uuid NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    total_days integer NOT NULL,
    rental_fee numeric(12,2) NOT NULL,
    deposit_amount numeric(12,2) NOT NULL,
    discount_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    grand_total numeric(12,2) NOT NULL,
    order_status public.order_status DEFAULT 'PENDING'::public.order_status NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_rental_orders_amounts CHECK (((rental_fee >= (0)::numeric) AND (deposit_amount >= (0)::numeric) AND (discount_amount >= (0)::numeric) AND (grand_total >= (0)::numeric))),
    CONSTRAINT chk_rental_orders_date_range CHECK ((end_date > start_date)),
    CONSTRAINT chk_rental_orders_total_days CHECK ((total_days >= 1))
);


ALTER TABLE public.rental_orders OWNER TO postgres;

--
-- Name: return_inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.return_inspections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    unit_id uuid NOT NULL,
    inspector_user_id uuid NOT NULL,
    actual_return_time timestamp with time zone NOT NULL,
    initial_battery_health integer NOT NULL,
    returned_battery_health integer NOT NULL,
    icloud_removed boolean DEFAULT false NOT NULL,
    passcode_removed boolean DEFAULT false NOT NULL,
    screen_condition public.screen_condition NOT NULL,
    body_condition public.body_condition NOT NULL,
    camera_functional boolean DEFAULT true NOT NULL,
    face_id_functional boolean DEFAULT true NOT NULL,
    wifi_cellular_functional boolean DEFAULT true NOT NULL,
    accessories_returned jsonb,
    inspection_notes text,
    inspection_images text[],
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_return_inspections_accessories_json CHECK (((accessories_returned IS NULL) OR (jsonb_typeof(accessories_returned) = 'object'::text))),
    CONSTRAINT chk_return_inspections_battery_degradation CHECK ((returned_battery_health <= initial_battery_health)),
    CONSTRAINT chk_return_inspections_battery_range CHECK ((((initial_battery_health >= 0) AND (initial_battery_health <= 100)) AND ((returned_battery_health >= 0) AND (returned_battery_health <= 100)))),
    CONSTRAINT chk_return_inspections_images CHECK (((inspection_images IS NULL) OR (array_length(inspection_images, 1) > 0)))
);


ALTER TABLE public.return_inspections OWNER TO postgres;

--
-- Name: unit_booking_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_booking_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    unit_id uuid NOT NULL,
    order_id uuid NOT NULL,
    reserved_from timestamp with time zone NOT NULL,
    reserved_to timestamp with time zone NOT NULL,
    status public.booking_slot_status DEFAULT 'RESERVED'::public.booking_slot_status NOT NULL,
    CONSTRAINT chk_unit_booking_slots_time_range CHECK ((reserved_to > reserved_from))
);


ALTER TABLE public.unit_booking_slots OWNER TO postgres;

--
-- Name: unit_maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_maintenances (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    unit_id uuid NOT NULL,
    maintenance_type public.maintenance_type NOT NULL,
    cost numeric(12,2) DEFAULT 0.00 NOT NULL,
    start_date timestamp with time zone NOT NULL,
    completed_date timestamp with time zone,
    vendor_name character varying(150),
    description text NOT NULL,
    created_by_user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_unit_maintenances_cost_non_negative CHECK ((cost >= (0)::numeric)),
    CONSTRAINT chk_unit_maintenances_date_order CHECK (((completed_date IS NULL) OR (completed_date >= start_date))),
    CONSTRAINT chk_unit_maintenances_description_not_blank CHECK ((length(TRIM(BOTH FROM description)) > 0))
);


ALTER TABLE public.unit_maintenances OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role DEFAULT 'CUSTOMER'::public.user_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_name, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: customer_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customer_addresses (id, customer_id, address_label, street_address, city, province, postal_code, is_primary) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, user_id, full_name, phone_number, nik_ktp, ktp_image_url, selfie_ktp_image_url, social_media_link, is_verified, verified_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: fines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fines (id, order_id, inspection_id, fine_type, amount, reason, deducted_from_deposit, settlement_status, created_at) FROM stdin;
\.


--
-- Data for Name: iphone_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iphone_images (id, variant_id, image_url, is_primary, display_order) FROM stdin;
\.


--
-- Data for Name: iphone_models; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iphone_models (id, model_name, release_year, screen_size, processor, camera_specs, description, is_published, created_at) FROM stdin;
\.


--
-- Data for Name: iphone_units; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iphone_units (id, variant_id, imei, serial_number, battery_health, physical_grade, current_status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: iphone_variants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.iphone_variants (id, model_id, storage_capacity, color_name, daily_rate, weekly_rate, monthly_rate, security_deposit_amount, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, order_id, payment_number, payment_type, amount, payment_method, proof_image_url, status, verified_by_user_id, verified_at, created_at) FROM stdin;
\.


--
-- Data for Name: rental_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_items (id, order_id, variant_id, allocated_unit_id, item_daily_price, item_subtotal) FROM stdin;
\.


--
-- Data for Name: rental_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rental_orders (id, order_number, customer_id, start_date, end_date, total_days, rental_fee, deposit_amount, discount_amount, grand_total, order_status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: return_inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.return_inspections (id, order_id, unit_id, inspector_user_id, actual_return_time, initial_battery_health, returned_battery_health, icloud_removed, passcode_removed, screen_condition, body_condition, camera_functional, face_id_functional, wifi_cellular_functional, accessories_returned, inspection_notes, inspection_images, created_at) FROM stdin;
\.


--
-- Data for Name: unit_booking_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_booking_slots (id, unit_id, order_id, reserved_from, reserved_to, status) FROM stdin;
\.


--
-- Data for Name: unit_maintenances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_maintenances (id, unit_id, maintenance_type, cost, start_date, completed_date, vendor_name, description, created_by_user_id, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, role, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: customer_addresses customer_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT customer_addresses_pkey PRIMARY KEY (id);


--
-- Name: customers customers_nik_ktp_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_nik_ktp_key UNIQUE (nik_ktp);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_key UNIQUE (user_id);


--
-- Name: unit_booking_slots ex_unit_booking_slots_no_overlap; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_booking_slots
    ADD CONSTRAINT ex_unit_booking_slots_no_overlap EXCLUDE USING gist (unit_id WITH =, tstzrange(reserved_from, reserved_to, '[)'::text) WITH &&) WHERE ((status = ANY (ARRAY['RESERVED'::public.booking_slot_status, 'ACTIVE'::public.booking_slot_status])));


--
-- Name: fines fines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fines_pkey PRIMARY KEY (id);


--
-- Name: iphone_images iphone_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_images
    ADD CONSTRAINT iphone_images_pkey PRIMARY KEY (id);


--
-- Name: iphone_models iphone_models_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_models
    ADD CONSTRAINT iphone_models_pkey PRIMARY KEY (id);


--
-- Name: iphone_units iphone_units_imei_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_units
    ADD CONSTRAINT iphone_units_imei_key UNIQUE (imei);


--
-- Name: iphone_units iphone_units_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_units
    ADD CONSTRAINT iphone_units_pkey PRIMARY KEY (id);


--
-- Name: iphone_units iphone_units_serial_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_units
    ADD CONSTRAINT iphone_units_serial_number_key UNIQUE (serial_number);


--
-- Name: iphone_variants iphone_variants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_variants
    ADD CONSTRAINT iphone_variants_pkey PRIMARY KEY (id);


--
-- Name: payments payments_payment_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_payment_number_key UNIQUE (payment_number);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: rental_items rental_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT rental_items_pkey PRIMARY KEY (id);


--
-- Name: rental_orders rental_orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_orders
    ADD CONSTRAINT rental_orders_order_number_key UNIQUE (order_number);


--
-- Name: rental_orders rental_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_orders
    ADD CONSTRAINT rental_orders_pkey PRIMARY KEY (id);


--
-- Name: return_inspections return_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_inspections
    ADD CONSTRAINT return_inspections_pkey PRIMARY KEY (id);


--
-- Name: unit_booking_slots unit_booking_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_booking_slots
    ADD CONSTRAINT unit_booking_slots_pkey PRIMARY KEY (id);


--
-- Name: unit_maintenances unit_maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_maintenances
    ADD CONSTRAINT unit_maintenances_pkey PRIMARY KEY (id);


--
-- Name: iphone_models uq_iphone_models_model_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_models
    ADD CONSTRAINT uq_iphone_models_model_name UNIQUE (model_name);


--
-- Name: iphone_variants uq_iphone_variants_model_storage_color; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_variants
    ADD CONSTRAINT uq_iphone_variants_model_storage_color UNIQUE (model_id, storage_capacity, color_name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action ON public.audit_logs USING btree (action);


--
-- Name: idx_audit_logs_action_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_action_created ON public.audit_logs USING btree (action, created_at DESC);


--
-- Name: idx_audit_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);


--
-- Name: idx_audit_logs_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity ON public.audit_logs USING btree (entity_name, entity_id, created_at DESC);


--
-- Name: idx_audit_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity_id ON public.audit_logs USING btree (entity_id);


--
-- Name: idx_audit_logs_entity_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_entity_name ON public.audit_logs USING btree (entity_name);


--
-- Name: idx_audit_logs_new_values_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_new_values_gin ON public.audit_logs USING gin (new_values);


--
-- Name: idx_audit_logs_old_values_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_old_values_gin ON public.audit_logs USING gin (old_values);


--
-- Name: idx_audit_logs_user_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_created ON public.audit_logs USING btree (user_id, created_at DESC);


--
-- Name: idx_audit_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs USING btree (user_id);


--
-- Name: idx_customer_addresses_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_addresses_customer_id ON public.customer_addresses USING btree (customer_id);


--
-- Name: idx_customer_addresses_is_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_addresses_is_primary ON public.customer_addresses USING btree (is_primary);


--
-- Name: idx_customers_is_verified; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_is_verified ON public.customers USING btree (is_verified);


--
-- Name: idx_customers_phone_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_phone_number ON public.customers USING btree (phone_number);


--
-- Name: idx_customers_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customers_user_id ON public.customers USING btree (user_id);


--
-- Name: idx_fines_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_created_at ON public.fines USING btree (created_at DESC);


--
-- Name: idx_fines_fine_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_fine_type ON public.fines USING btree (fine_type);


--
-- Name: idx_fines_inspection_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_inspection_id ON public.fines USING btree (inspection_id);


--
-- Name: idx_fines_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_order_id ON public.fines USING btree (order_id);


--
-- Name: idx_fines_order_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_order_type ON public.fines USING btree (order_id, fine_type);


--
-- Name: idx_fines_settlement_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_settlement_status ON public.fines USING btree (settlement_status);


--
-- Name: idx_fines_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_fines_status_created ON public.fines USING btree (settlement_status, created_at DESC);


--
-- Name: idx_iphone_images_display_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_images_display_order ON public.iphone_images USING btree (variant_id, display_order);


--
-- Name: idx_iphone_images_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_images_variant_id ON public.iphone_images USING btree (variant_id);


--
-- Name: idx_iphone_models_is_published; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_models_is_published ON public.iphone_models USING btree (is_published);


--
-- Name: idx_iphone_models_model_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_models_model_name ON public.iphone_models USING btree (model_name);


--
-- Name: idx_iphone_models_release_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_models_release_year ON public.iphone_models USING btree (release_year);


--
-- Name: idx_iphone_units_current_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_current_status ON public.iphone_units USING btree (current_status);


--
-- Name: idx_iphone_units_imei; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_imei ON public.iphone_units USING btree (imei);


--
-- Name: idx_iphone_units_physical_grade; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_physical_grade ON public.iphone_units USING btree (physical_grade);


--
-- Name: idx_iphone_units_serial_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_serial_number ON public.iphone_units USING btree (serial_number);


--
-- Name: idx_iphone_units_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_variant_id ON public.iphone_units USING btree (variant_id);


--
-- Name: idx_iphone_units_variant_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_units_variant_status ON public.iphone_units USING btree (variant_id, current_status);


--
-- Name: idx_iphone_variants_daily_rate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_variants_daily_rate ON public.iphone_variants USING btree (daily_rate);


--
-- Name: idx_iphone_variants_model_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_iphone_variants_model_id ON public.iphone_variants USING btree (model_id);


--
-- Name: idx_payments_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_created_at ON public.payments USING btree (created_at DESC);


--
-- Name: idx_payments_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);


--
-- Name: idx_payments_order_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_order_type ON public.payments USING btree (order_id, payment_type);


--
-- Name: idx_payments_payment_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_payment_number ON public.payments USING btree (payment_number);


--
-- Name: idx_payments_payment_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_payment_type ON public.payments USING btree (payment_type);


--
-- Name: idx_payments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status ON public.payments USING btree (status);


--
-- Name: idx_payments_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_status_created ON public.payments USING btree (status, created_at DESC);


--
-- Name: idx_payments_verified_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_payments_verified_by ON public.payments USING btree (verified_by_user_id);


--
-- Name: idx_rental_items_allocated_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_items_allocated_unit_id ON public.rental_items USING btree (allocated_unit_id);


--
-- Name: idx_rental_items_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_items_order_id ON public.rental_items USING btree (order_id);


--
-- Name: idx_rental_items_variant_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_items_variant_id ON public.rental_items USING btree (variant_id);


--
-- Name: idx_rental_orders_customer_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_customer_id ON public.rental_orders USING btree (customer_id);


--
-- Name: idx_rental_orders_customer_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_customer_status ON public.rental_orders USING btree (customer_id, order_status);


--
-- Name: idx_rental_orders_end_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_end_date ON public.rental_orders USING btree (end_date);


--
-- Name: idx_rental_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_order_number ON public.rental_orders USING btree (order_number);


--
-- Name: idx_rental_orders_order_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_order_status ON public.rental_orders USING btree (order_status);


--
-- Name: idx_rental_orders_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_start_date ON public.rental_orders USING btree (start_date);


--
-- Name: idx_rental_orders_status_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_rental_orders_status_created ON public.rental_orders USING btree (order_status, created_at DESC);


--
-- Name: idx_return_inspections_accessories_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_accessories_gin ON public.return_inspections USING gin (accessories_returned);


--
-- Name: idx_return_inspections_actual_return; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_actual_return ON public.return_inspections USING btree (actual_return_time DESC);


--
-- Name: idx_return_inspections_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_created_at ON public.return_inspections USING btree (created_at DESC);


--
-- Name: idx_return_inspections_inspector_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_inspector_user_id ON public.return_inspections USING btree (inspector_user_id);


--
-- Name: idx_return_inspections_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_order_id ON public.return_inspections USING btree (order_id);


--
-- Name: idx_return_inspections_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_unit_id ON public.return_inspections USING btree (unit_id);


--
-- Name: idx_return_inspections_unit_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_return_inspections_unit_order ON public.return_inspections USING btree (unit_id, order_id);


--
-- Name: idx_unit_booking_slots_order_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_booking_slots_order_id ON public.unit_booking_slots USING btree (order_id);


--
-- Name: idx_unit_booking_slots_reserved_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_booking_slots_reserved_range ON public.unit_booking_slots USING gist (tstzrange(reserved_from, reserved_to, '[)'::text));


--
-- Name: idx_unit_booking_slots_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_booking_slots_status ON public.unit_booking_slots USING btree (status);


--
-- Name: idx_unit_booking_slots_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_booking_slots_unit_id ON public.unit_booking_slots USING btree (unit_id);


--
-- Name: idx_unit_booking_slots_unit_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_booking_slots_unit_time ON public.unit_booking_slots USING btree (unit_id, reserved_from, reserved_to);


--
-- Name: idx_unit_maintenances_completed; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_completed ON public.unit_maintenances USING btree (completed_date);


--
-- Name: idx_unit_maintenances_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_created_at ON public.unit_maintenances USING btree (created_at DESC);


--
-- Name: idx_unit_maintenances_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_created_by ON public.unit_maintenances USING btree (created_by_user_id);


--
-- Name: idx_unit_maintenances_ongoing; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_ongoing ON public.unit_maintenances USING btree (unit_id, start_date) WHERE (completed_date IS NULL);


--
-- Name: idx_unit_maintenances_start_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_start_date ON public.unit_maintenances USING btree (start_date DESC);


--
-- Name: idx_unit_maintenances_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_type ON public.unit_maintenances USING btree (maintenance_type);


--
-- Name: idx_unit_maintenances_unit_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_unit_id ON public.unit_maintenances USING btree (unit_id);


--
-- Name: idx_unit_maintenances_unit_start; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_unit_maintenances_unit_start ON public.unit_maintenances USING btree (unit_id, start_date DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: uq_customer_addresses_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_customer_addresses_primary ON public.customer_addresses USING btree (customer_id) WHERE (is_primary = true);


--
-- Name: uq_iphone_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_iphone_images_primary ON public.iphone_images USING btree (variant_id) WHERE (is_primary = true);


--
-- Name: uq_rental_items_allocated_unit; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_rental_items_allocated_unit ON public.rental_items USING btree (allocated_unit_id) WHERE (allocated_unit_id IS NOT NULL);


--
-- Name: customers trg_customers_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: iphone_units trg_iphone_units_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_iphone_units_updated_at BEFORE UPDATE ON public.iphone_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: rental_orders trg_rental_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_rental_orders_updated_at BEFORE UPDATE ON public.rental_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users trg_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: audit_logs fk_audit_logs_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: customer_addresses fk_customer_addresses_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer_addresses
    ADD CONSTRAINT fk_customer_addresses_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customers fk_customers_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fines fk_fines_inspection; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fk_fines_inspection FOREIGN KEY (inspection_id) REFERENCES public.return_inspections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fines fk_fines_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fines
    ADD CONSTRAINT fk_fines_order FOREIGN KEY (order_id) REFERENCES public.rental_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: iphone_images fk_iphone_images_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_images
    ADD CONSTRAINT fk_iphone_images_variant FOREIGN KEY (variant_id) REFERENCES public.iphone_variants(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: iphone_units fk_iphone_units_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_units
    ADD CONSTRAINT fk_iphone_units_variant FOREIGN KEY (variant_id) REFERENCES public.iphone_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: iphone_variants fk_iphone_variants_model; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.iphone_variants
    ADD CONSTRAINT fk_iphone_variants_model FOREIGN KEY (model_id) REFERENCES public.iphone_models(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments fk_payments_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES public.rental_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments fk_payments_verified_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk_payments_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rental_items fk_rental_items_allocated_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT fk_rental_items_allocated_unit FOREIGN KEY (allocated_unit_id) REFERENCES public.iphone_units(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: rental_items fk_rental_items_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT fk_rental_items_order FOREIGN KEY (order_id) REFERENCES public.rental_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: rental_items fk_rental_items_variant; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_items
    ADD CONSTRAINT fk_rental_items_variant FOREIGN KEY (variant_id) REFERENCES public.iphone_variants(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: rental_orders fk_rental_orders_customer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rental_orders
    ADD CONSTRAINT fk_rental_orders_customer FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: return_inspections fk_return_inspections_inspector; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_inspections
    ADD CONSTRAINT fk_return_inspections_inspector FOREIGN KEY (inspector_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: return_inspections fk_return_inspections_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_inspections
    ADD CONSTRAINT fk_return_inspections_order FOREIGN KEY (order_id) REFERENCES public.rental_orders(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: return_inspections fk_return_inspections_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.return_inspections
    ADD CONSTRAINT fk_return_inspections_unit FOREIGN KEY (unit_id) REFERENCES public.iphone_units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: unit_booking_slots fk_unit_booking_slots_order; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_booking_slots
    ADD CONSTRAINT fk_unit_booking_slots_order FOREIGN KEY (order_id) REFERENCES public.rental_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: unit_booking_slots fk_unit_booking_slots_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_booking_slots
    ADD CONSTRAINT fk_unit_booking_slots_unit FOREIGN KEY (unit_id) REFERENCES public.iphone_units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: unit_maintenances fk_unit_maintenances_created_by; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_maintenances
    ADD CONSTRAINT fk_unit_maintenances_created_by FOREIGN KEY (created_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: unit_maintenances fk_unit_maintenances_unit; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_maintenances
    ADD CONSTRAINT fk_unit_maintenances_unit FOREIGN KEY (unit_id) REFERENCES public.iphone_units(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict EatEopBZHU7HdNmc1qlQuWXEaj2PBu8DInVtMcbaV3bquvo2aQmSCEEbwAfQcq4

