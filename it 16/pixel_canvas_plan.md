# Pixel Canvas Project – Full Build Plan

## 1. Project Summary

A modern take on the Million Dollar Homepage: a fullscreen, rectangular pixel grid where users buy pixels to place an image or drawing. Total sale value target: €15,000. Payments done via PayPal (personal account), no business registration required as long as it stays one-time hobby income. Non‑refundable purchases to prevent trolling.

## 2. Core Features

• Fullscreen rectangular canvas (no scrolling)

• Pixel‑based buying system: fixed price per pixel

• Upload image → scale → place → lock once paid

• Zoom & pan functionality for accuracy

• Minimalist, modern design with authentic retro feel

• Display credits when hovering over pixel areas

• Fully responsive on desktop, tablet, phone

## 3. Technical Stack

• Frontend: HTML, TailwindCSS, JavaScript (or React)

• Backend (serverless): Supabase functions

• Database: Supabase PostgreSQL

• File storage: Supabase storage bucket

• Payments: PayPal personal account + Webhooks

• Hosting: Netlify/Vercel (free tier possible)

## 4. Database Structure

Tables:

1. users

   - id

   - email (optional)

2. pixel_blocks

   - id

   - x, y, width, height

   - image_url

   - owner_id

   - status (“pending” / “paid”)

3. transactions

   - id

   - paypal_tx_id

   - user_id

   - amount

   - pixel_block_id

   - status

## 5. Payment Workflow

1. User selects pixel area

2. System calculates cost

3. User uploads image

4. System stores pixel block as “pending”

5. User pays via PayPal redirect

6. PayPal webhook hits Supabase function:

   • Verify payment

   • Mark block as “paid”

   • Lock pixel forever (no edits)

7. Canvas updates visually

## 6. Visual & UI Requirements

• Modern minimalistic theme

• Soft borders, slight shadows

• Subtle grid

• High‑resolution zoom interaction

• Pixel placement preview before paying

• Payment modal with clear non‑refund policy

## 7. Estimated Costs

• Domain: €10–15/year

• Supabase: free tier → Pro tier €23/month if needed

• Hosting: €0–5/month

• PayPal fees: ~2.9% + €0.35 per payment

Expected fees on €15,000 = ~€450–520

Estimated net profit ≈ €14,500

## 8. Legal & Tax Notes (Netherlands)

• This counts as ‘hobby income’

• No VAT/BTW needed

• Must be reported as “inkomsten uit overig werk”

• Keep it a one‑time art project to avoid business classification

• Make all sales non‑refundable

## 9. Development Timeline

Week 1 – Canvas + UI prototype

Week 2 – Supabase DB + image handling

Week 3 – PayPal integration + webhooks

Week 4 – Polishing, testing, launch

Total expected time: 3–5 weeks

## 10. Marketing Strategy

• Use TikTok/Instagram to show pixel placements in real time

• Limited number of pixels creates urgency

• Add a live “% sold” meter

• Offer first 1,000 pixels at a discount to create momentum
