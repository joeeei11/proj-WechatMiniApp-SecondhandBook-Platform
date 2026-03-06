// pages/message/message.js - 消息列表页
const { messageAPI } = require('../../utils/api')
const { formatTime } = require('../../utils/format')

Page({
    data: {
        conversations: [],
        loading: true,
        unreadTotal: 0
    },

    onShow() {
        this.loadConversations()
    },

    async loadConversations() {
        this.setData({ loading: true })
        try {
            // 云函数获取会话列表（绕过消息集合"仅创建者可读"权限）
            const conversations = await messageAPI.getConversations()
            const enriched = conversations.map(conv => ({
                ...conv,
                lastMsgContent: conv.lastMsg ? conv.lastMsg.content : '',
                lastMsgTime: conv.lastMsg ? formatTime(conv.lastMsg.createTime) : ''
            }))
            const unreadTotal = enriched.reduce((sum, c) => sum + (c.unread || 0), 0)
            this.setData({ conversations: enriched, loading: false, unreadTotal })
        } catch (err) {
            console.error('加载会话失败:', err)
            this.setData({ loading: false })
        }
    },

    goChat(e) {
        const { userId, nickName } = e.currentTarget.dataset
        wx.navigateTo({
            url: `/pages/chat/chat?userId=${userId}&bookTitle=${nickName}`
        })
    }
})
