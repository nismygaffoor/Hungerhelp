const escapeCsv = (value) => {
    const text = String(value ?? '');
    if (/[",\n\r]/.test(text)) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
};

const row = (...cells) => cells.map(escapeCsv).join(',');

const section = (lines, title, headers, entries) => {
    lines.push(title);
    lines.push(row(...headers));
    entries.forEach((entry) => lines.push(row(...entry)));
    lines.push('');
};

const monthlyRows = (series) => {
    const labels = series?.labels || [];
    const counts = series?.counts || [];
    return labels.map((label, i) => [label, counts[i] ?? 0]);
};

export const buildAnalyticsCsv = (data) => {
    const summary = data?.summary || {};
    const impact = data?.impact || {};
    const generatedAt = new Date().toLocaleString();
    const reportDate = new Date().toISOString().slice(0, 10);
    const lines = [];

    lines.push('HungerHelp Platform Analytics Report');
    lines.push(row('Generated', generatedAt));
    lines.push(row('Report Date', reportDate));
    lines.push('');

    section(lines, 'Platform Summary', ['Metric', 'Value'], [
        ['Total Users', summary.total_users ?? 0],
        ['Food Posts', summary.total_posts ?? 0],
        ['Total Deliveries', summary.total_deliveries ?? 0],
        ['Total Claims', summary.total_claims ?? 0],
        ['Delivered Posts', summary.delivered_posts ?? 0],
        ['Delivery Completion Rate (%)', summary.delivery_completion_rate ?? 0],
        ['Average Feedback Rating', summary.avg_feedback_rating ?? 0],
        ['Total Feedback Submissions', summary.total_feedback ?? 0],
        ['Verified Users', summary.verified_users ?? 0],
        ['Pending Verifications', summary.pending_verifications ?? 0],
        ['Rejected Users', summary.rejected_users ?? 0],
    ]);

    section(lines, 'Community Impact', ['Metric', 'Value'], [
        ['Meals Delivered', impact.meals_delivered ?? 0],
        ['Claims Made', impact.claims_made ?? 0],
        ['Deliveries Completed', impact.deliveries_completed ?? 0],
        ['Requests Fulfilled', impact.requests_fulfilled ?? 0],
    ]);

    section(lines, 'Requests & Feedback', ['Metric', 'Value'], [
        ['Total Requests', summary.total_requests ?? 0],
        ['Active Requests', summary.active_requests ?? 0],
        ['Fulfilled Requests', summary.fulfilled_requests ?? 0],
        ['Feedback Submissions', summary.total_feedback ?? 0],
    ]);

    section(
        lines,
        'Users by Role',
        ['Role', 'Count'],
        Object.entries(summary.users_by_role || {}).map(([role, count]) => [role, count])
    );

    section(
        lines,
        'Food Posts by Status',
        ['Status', 'Count'],
        Object.entries(summary.posts_by_status || {}).map(([status, count]) => [status, count])
    );

    section(
        lines,
        'Deliveries by Status',
        ['Status', 'Count'],
        Object.entries(summary.deliveries_by_status || {}).map(([status, count]) => [status, count])
    );

    section(
        lines,
        'Food Categories',
        ['Category', 'Count'],
        (data?.food_categories || []).map((cat) => [cat.name, cat.count])
    );

    section(lines, 'Monthly Donations (Last 6 Months)', ['Month', 'Posts'], monthlyRows(data?.monthly_donations));
    section(lines, 'Monthly Deliveries (Last 6 Months)', ['Month', 'Deliveries'], monthlyRows(data?.monthly_deliveries));
    section(lines, 'Monthly Registrations (Last 6 Months)', ['Month', 'Users'], monthlyRows(data?.monthly_registrations));

    lines.push('End of Report');

    return { content: `\uFEFF${lines.join('\r\n')}`, reportDate };
};

export const downloadAnalyticsReport = (data) => {
    const { content, reportDate } = buildAnalyticsCsv(data);
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hungerhelp-analytics-report-${reportDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
};
