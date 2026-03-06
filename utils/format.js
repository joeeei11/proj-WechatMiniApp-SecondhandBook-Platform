// utils/format.js - 格式化工具函数

/**
 * 格式化时间
 * @param {Date|string} date 
 * @returns {string}
 */
const formatTime = (date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    const now = new Date()
    const diff = now - d

    if (diff < 60 * 1000) return '刚刚'
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}分钟前`
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (3600 * 1000))}小时前`
    if (diff < 7 * 24 * 60 * 60 * 1000) return `${Math.floor(diff / (86400 * 1000))}天前`

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    if (year === now.getFullYear()) return `${month}-${day}`
    return `${year}-${month}-${day}`
}

/**
 * 格式化价格
 * @param {number} price 
 * @returns {string}
 */
const formatPrice = (price) => {
    if (price === undefined || price === null) return '0.00'
    return Number(price).toFixed(2)
}

/**
 * 书籍成色格式化
 */
const CONDITION_MAP = {
    'new': '全新',
    '10': '十成新',
    '9': '九成新',
    '8': '八成新',
    '7': '七成及以下'
}
const formatCondition = (condition) => CONDITION_MAP[condition] || condition

/**
 * 订单状态格式化
 */
const ORDER_STATUS_MAP = {
    'pending': { text: '待确认', color: '#E6A23C' },
    'confirmed': { text: '交易中', color: '#4A90E2' },
    'completed': { text: '已完成', color: '#67C23A' },
    'cancelled': { text: '已取消', color: '#999999' }
}
const formatOrderStatus = (status) => ORDER_STATUS_MAP[status] || { text: status, color: '#999' }

/**
 * 书籍状态格式化
 */
const BOOK_STATUS_MAP = {
    'on_sale': { text: '在售', color: '#67C23A' },
    'trading': { text: '交易中', color: '#E6A23C' },
    'sold': { text: '已售', color: '#999999' },
    'withdrawn': { text: '已下架', color: '#F56C6C' }
}
const formatBookStatus = (status) => BOOK_STATUS_MAP[status] || { text: status, color: '#999' }

/**
 * 信用分等级
 */
const getCreditLevel = (score) => {
    if (score >= 120) return { text: '信誉极佳', icon: '⭐⭐⭐', color: '#FFB800' }
    if (score >= 100) return { text: '信誉良好', icon: '⭐⭐', color: '#67C23A' }
    if (score >= 80) return { text: '信誉一般', icon: '⭐', color: '#E6A23C' }
    return { text: '信誉较差', icon: '⚠️', color: '#F56C6C' }
}

/**
 * 生成星级字符串
 */
const formatStars = (score) => {
    const full = Math.round(score)
    return '★'.repeat(full) + '☆'.repeat(5 - full)
}

/**
 * 年级列表
 */
const GRADES = ['2021', '2022', '2023', '2024', '2025']

/**
 * 学院列表
 */
const COLLEGES = [
    '公共管理学院', '商学院', '文学与新闻学院', '法学院', '外国语学院',
    '理学院', '化工学院', '碧泉书院', '信息工程学院', '机械工程与力学学院',
    '材料科学与工程学院', '建筑与艺术设计学院', '体育学院', '马克思主义学院'
]

module.exports = {
    formatTime,
    formatPrice,
    formatCondition,
    formatOrderStatus,
    formatBookStatus,
    getCreditLevel,
    formatStars,
    GRADES,
    COLLEGES,
    CONDITION_MAP,
    ORDER_STATUS_MAP
}
