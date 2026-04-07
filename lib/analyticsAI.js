/**
 * Local Analytics AI Engine — Free, no API keys required.
 * Analyses booking/traffic data and generates actionable insights.
 */

export function generateInsights(analyticsData, bookingStats) {
  const insights = [];

  // ─── Traffic Analysis ──────────────────────────────────────────────────────
  if (analyticsData) {
    const { totalPageViews, totalVisitors, topPages, topReferrers, deviceBreakdown, pageViewsByDay } = analyticsData;

    // Bounce / engagement
    if (totalVisitors > 0 && totalPageViews > 0) {
      const pagesPerVisit = (totalPageViews / totalVisitors).toFixed(1);
      if (pagesPerVisit < 2) {
        insights.push({
          type: 'warning',
          title: 'Low Engagement Detected',
          message: `Visitors view only ${pagesPerVisit} pages on average. Consider adding more internal links, featured courts on the homepage, or promotional banners to keep users exploring.`,
        });
      } else {
        insights.push({
          type: 'success',
          title: 'Good Engagement',
          message: `Visitors view ${pagesPerVisit} pages on average — solid engagement. Keep optimising the booking funnel to convert browsers into bookers.`,
        });
      }
    }

    // Device breakdown
    if (deviceBreakdown) {
      const total = (deviceBreakdown.desktop || 0) + (deviceBreakdown.mobile || 0) + (deviceBreakdown.tablet || 0);
      if (total > 0) {
        const mobilePct = Math.round(((deviceBreakdown.mobile || 0) / total) * 100);
        if (mobilePct > 60) {
          insights.push({
            type: 'info',
            title: `${mobilePct}% Mobile Traffic`,
            message: `Most of your visitors are on mobile. Make sure the booking form, court images, and payment flow are all optimised for small screens. Consider adding a "Book Now" sticky button on mobile.`,
          });
        } else if (mobilePct < 30) {
          insights.push({
            type: 'info',
            title: 'Desktop-Heavy Traffic',
            message: `Only ${mobilePct}% of traffic is mobile. Your audience may be booking from work. Consider lunch-hour promotions or corporate packages to capitalise on this.`,
          });
        }
      }
    }

    // Traffic trends
    if (pageViewsByDay?.length >= 7) {
      const last7 = pageViewsByDay.slice(-7);
      const prev7 = pageViewsByDay.slice(-14, -7);
      if (prev7.length >= 7) {
        const recentTotal = last7.reduce((s, d) => s + d.count, 0);
        const prevTotal = prev7.reduce((s, d) => s + d.count, 0);
        if (prevTotal > 0) {
          const change = Math.round(((recentTotal - prevTotal) / prevTotal) * 100);
          if (change > 10) {
            insights.push({
              type: 'success',
              title: `Traffic Up ${change}%`,
              message: `Page views increased ${change}% compared to the previous week. Great momentum — consider running a limited-time promotion to convert this traffic into bookings.`,
            });
          } else if (change < -10) {
            insights.push({
              type: 'warning',
              title: `Traffic Down ${Math.abs(change)}%`,
              message: `Page views dropped ${Math.abs(change)}% compared to the previous week. Consider social media posts, WhatsApp group shares, or a referral discount to bring visitors back.`,
            });
          }
        }
      }
    }

    // Top referrer insight
    if (topReferrers?.length > 0) {
      const directTraffic = topReferrers.find((r) => !r.referrer || r.referrer === 'direct');
      const totalVisits = topReferrers.reduce((s, r) => s + r.visits, 0);
      if (directTraffic && totalVisits > 0) {
        const directPct = Math.round((directTraffic.visits / totalVisits) * 100);
        if (directPct > 70) {
          insights.push({
            type: 'info',
            title: 'Mostly Direct Traffic',
            message: `${directPct}% of visitors come directly — they already know your brand. To grow, invest in Google My Business, Instagram, and local Facebook groups to attract new visitors.`,
          });
        }
      }
    }

    // Top page insight
    if (topPages?.length > 0) {
      const courtPage = topPages.find((p) => p.path?.includes('/courts'));
      const bookingPage = topPages.find((p) => p.path?.includes('/bookings') || p.path?.includes('/book'));
      if (courtPage && !bookingPage) {
        insights.push({
          type: 'warning',
          title: 'Courts Viewed But Low Booking Traffic',
          message: `The courts page gets views but the bookings page doesn't rank in your top pages. This could mean users are browsing but not converting. Add a prominent "Book Now" CTA on each court card.`,
        });
      }
    }
  }

  // ─── Booking Analysis ──────────────────────────────────────────────────────
  if (bookingStats) {
    const { totalBookings, totalRevenue, avgBookingValue, statusCounts, peakHours, courtBreakdown, unpaidConfirmed } = bookingStats;

    // Revenue insight
    if (totalRevenue > 0 && totalBookings > 0) {
      insights.push({
        type: 'info',
        title: `Avg Booking Value: R${avgBookingValue}`,
        message: `Your average booking is R${avgBookingValue}. To increase this, consider offering multi-hour discounts (e.g. "Book 2hrs, get 10% off") or premium time-slot pricing for peak hours.`,
      });
    }

    // Cancellation rate
    if (statusCounts) {
      const total = (statusCounts.confirmed || 0) + (statusCounts.pending || 0) + (statusCounts.cancelled || 0);
      if (total > 5) {
        const cancelPct = Math.round(((statusCounts.cancelled || 0) / total) * 100);
        if (cancelPct > 20) {
          insights.push({
            type: 'warning',
            title: `${cancelPct}% Cancellation Rate`,
            message: `Your cancellation rate is high. Consider adding a cancellation policy (e.g. no refund within 24hrs), requiring a deposit, or sending reminder WhatsApps 2 hours before the booking.`,
          });
        } else if (cancelPct < 5) {
          insights.push({
            type: 'success',
            title: 'Excellent Retention',
            message: `Only ${cancelPct}% of bookings are cancelled — your customers are committed. Consider a loyalty programme to reward repeat bookers.`,
          });
        }

        // Pending bookings
        const pendingPct = Math.round(((statusCounts.pending || 0) / total) * 100);
        if (pendingPct > 30) {
          insights.push({
            type: 'warning',
            title: `${statusCounts.pending} Pending Bookings`,
            message: `${pendingPct}% of bookings are still pending. Auto-confirm bookings with online payment, or set up a WhatsApp notification to confirm faster.`,
          });
        }
      }
    }

    // Unpaid confirmed
    if (unpaidConfirmed > 0) {
      insights.push({
        type: 'warning',
        title: `${unpaidConfirmed} Confirmed But Unpaid`,
        message: `You have ${unpaidConfirmed} confirmed bookings without payment. Follow up with these customers or consider requiring payment at booking to reduce no-shows.`,
      });
    }

    // Peak hours
    if (peakHours?.length > 0) {
      const peak = peakHours[0];
      insights.push({
        type: 'info',
        title: `Peak Hour: ${peak.hour}`,
        message: `Your busiest time is ${peak.hour} with ${peak.count} bookings. Consider premium pricing during peak hours and discounts for off-peak slots to spread demand evenly.`,
      });
    }

    // Court performance
    if (courtBreakdown?.length > 1) {
      const best = courtBreakdown[0];
      const worst = courtBreakdown[courtBreakdown.length - 1];
      if (best.bookings > worst.bookings * 3) {
        insights.push({
          type: 'info',
          title: 'Court Imbalance',
          message: `"${best.name}" gets ${best.bookings} bookings vs "${worst.name}" with only ${worst.bookings}. Consider promoting the underperforming court with a lower price or a "Try a new court" discount.`,
        });
      }
    }
  }

  // Always return at least one insight
  if (insights.length === 0) {
    insights.push({
      type: 'info',
      title: 'Not Enough Data Yet',
      message: 'Keep collecting data for a few more days. The AI will generate personalised insights once there are enough traffic and booking patterns to analyse.',
    });
  }

  return insights.slice(0, 8); // Cap at 8 insights
}

/**
 * Answer a question about analytics data
 */
export function answerQuestion(question, analyticsData, bookingStats) {
  const q = question.toLowerCase().trim();

  if (q.includes('revenue') || q.includes('money') || q.includes('income') || q.includes('earn')) {
    if (bookingStats?.totalRevenue != null) {
      const rev = bookingStats.totalRevenue;
      const avg = bookingStats.avgBookingValue || 0;
      return `Your total revenue is R${rev.toLocaleString()} with an average of R${avg} per booking. ${rev > 5000 ? 'Consider raising prices during peak hours to increase margins.' : 'Focus on getting more bookings — share on local WhatsApp groups and Facebook.'}`;
    }
    return 'Revenue data is not yet available. Make sure the dashboard has loaded fully.';
  }

  if (q.includes('cancel') || q.includes('refund')) {
    const cancelled = bookingStats?.statusCounts?.cancelled || 0;
    const total = (bookingStats?.statusCounts?.confirmed || 0) + (bookingStats?.statusCounts?.pending || 0) + cancelled;
    if (total > 0) {
      const pct = Math.round((cancelled / total) * 100);
      return `${cancelled} bookings have been cancelled (${pct}% of total). ${pct > 15 ? 'This is above average — consider adding a cancellation fee or requiring deposits.' : 'This is within normal range.'}`;
    }
    return 'No booking data available to analyse cancellations.';
  }

  if (q.includes('peak') || q.includes('busy') || q.includes('popular time')) {
    if (bookingStats?.peakHours?.length > 0) {
      const top3 = bookingStats.peakHours.slice(0, 3).map((h) => `${h.hour} (${h.count} bookings)`).join(', ');
      return `Your peak hours are: ${top3}. Consider premium pricing during these times and discounts for quiet periods.`;
    }
    return 'Not enough booking data to determine peak hours yet.';
  }

  if (q.includes('court') && (q.includes('best') || q.includes('popular') || q.includes('most'))) {
    if (bookingStats?.courtBreakdown?.length > 0) {
      const best = bookingStats.courtBreakdown[0];
      return `Your most popular court is "${best.name}" with ${best.bookings} bookings and R${best.revenue.toLocaleString()} revenue. ${bookingStats.courtBreakdown.length > 1 ? `Least popular: "${bookingStats.courtBreakdown[bookingStats.courtBreakdown.length - 1].name}".` : ''}`;
    }
    return 'No court performance data available yet.';
  }

  if (q.includes('mobile') || q.includes('phone') || q.includes('device')) {
    if (analyticsData?.deviceBreakdown) {
      const d = analyticsData.deviceBreakdown;
      const total = (d.desktop || 0) + (d.mobile || 0) + (d.tablet || 0);
      if (total > 0) {
        return `Desktop: ${Math.round(((d.desktop || 0) / total) * 100)}%, Mobile: ${Math.round(((d.mobile || 0) / total) * 100)}%, Tablet: ${Math.round(((d.tablet || 0) / total) * 100)}%. ${(d.mobile || 0) > (d.desktop || 0) ? 'Most users are on mobile — make sure your booking flow is mobile-friendly.' : 'Desktop users dominate — your audience likely books from work.'}`;
      }
    }
    return 'No device breakdown data available yet.';
  }

  if (q.includes('traffic') || q.includes('visitor') || q.includes('view')) {
    if (analyticsData) {
      return `You've had ${analyticsData.totalPageViews?.toLocaleString() || 0} page views from ${analyticsData.totalVisitors?.toLocaleString() || 0} unique visitors. ${analyticsData.topPages?.[0] ? `Most visited page: ${analyticsData.topPages[0].path}` : ''}`;
    }
    return 'Traffic data is not yet available.';
  }

  if (q.includes('help') || q.includes('what can you') || q.includes('what do you')) {
    return 'I can help you understand your analytics! Try asking about: revenue, cancellations, peak hours, popular courts, device breakdown, traffic, or visitor trends. I analyse your real data to give you actionable advice.';
  }

  if (q.includes('improve') || q.includes('grow') || q.includes('more booking')) {
    const tips = [];
    if (bookingStats?.totalBookings < 20) tips.push('Share your booking link on local WhatsApp groups and Facebook pages.');
    if (bookingStats?.statusCounts?.pending > 5) tips.push('Speed up booking confirmations — auto-confirm online payments.');
    tips.push('Post action photos from games on Instagram with your booking link.');
    tips.push('Offer a "first booking 10% off" promo code for new customers.');
    tips.push('Set up Google My Business so people can find you when searching for "5-a-side near me".');
    return `Here are some tips to grow bookings:\n\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }

  return `I can analyse your booking data, traffic patterns, revenue trends, court performance, cancellation rates, and more. Try asking:\n\n• "How is my revenue doing?"\n• "What are my peak hours?"\n• "Which court is most popular?"\n• "How can I get more bookings?"\n• "What devices do visitors use?"`;
}
