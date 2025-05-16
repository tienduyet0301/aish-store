"use client";

import { useWishlist } from '@/context/WishlistContext';
import ProductGrid from '@/components/ProductGrid';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function SavedItemsPage() {
  const { wishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div className="container mx-auto px-4 py-8">
        {wishlist.length === 0 ? (
          <div style={styles.emptyState}>
            <h2 style={styles.noItemsTitle}>NO SAVED ITEMS</h2>
            <div style={styles.dividerLine}></div>
            <p style={styles.noItemsText}>You have no saved items to view.</p>
            <p style={styles.subText}>
              Once you save items on aish.com you'll be able to view them here.
            </p>
            <Link href="/products">
              <button style={styles.continueButton}>
                CONTINUE SHOPPING
              </button>
            </Link>
            <div style={styles.contactInfo}>
              <div style={styles.contactItem}>
                <span style={styles.phoneIcon}>☎</span>
                <a href="tel:+61300492212" style={styles.contactLink}>+61 1300492212</a>
              </div>
              <span style={styles.divider}>|</span>
              <div style={styles.contactItem}>
                <span style={styles.emailIcon}>✉</span>
                <a href="mailto:clientservice.au@aish.com" style={styles.contactLink}>
                  clientservice.au@aish.com
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">SAVED ITEMS</h1>
              <p className="text-gray-600">
                You Have {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'} In Saved Items.
              </p>
            </div>
            <ProductGrid products={wishlist} />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  noItemsTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: '8px',
    letterSpacing: '2px',
  },
  dividerLine: {
    width: '80px',
    height: '1px',
    backgroundColor: '#000000',
    margin: '0 auto 30px',
  },
  noItemsText: {
    fontSize: '16px',
    color: '#000000',
    marginBottom: '10px',
    fontWeight: '400',
  },
  subText: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '30px',
    maxWidth: '400px',
    lineHeight: '1.5',
  },
  continueButton: {
    backgroundColor: '#000000',
    color: '#ffffff',
    border: 'none',
    padding: '15px 30px',
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '1px',
    marginBottom: '40px',
    transition: 'background-color 0.3s',
    borderRadius: '4px',
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '30px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  contactLink: {
    color: '#000000',
    textDecoration: 'none',
    fontSize: '14px',
  },
  phoneIcon: {
    fontSize: '16px',
    color: '#000000',
  },
  emailIcon: {
    fontSize: '16px',
    color: '#000000',
  },
  divider: {
    color: '#000000',
    fontSize: '16px',
    fontWeight: '300',
    margin: '0 5px',
  },
}; 