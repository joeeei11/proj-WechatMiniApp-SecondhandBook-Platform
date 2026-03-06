// pages/search/search.js - 搜索页面
const { bookAPI } = require('../../utils/api')
const { COLLEGES, CONDITION_MAP } = require('../../utils/format')

Page({
    data: {
        keyword: '',
        results: [],
        loading: false,
        searched: false,
        conditionMap: CONDITION_MAP,
        // 筛选条件
        colleges: COLLEGES,
        selectedCollege: '',
        conditions: [
            { value: '', label: '全部成色' },
            { value: 'new', label: '全新' },
            { value: '9', label: '九成新' },
            { value: '8', label: '八成新' },
            { value: '7', label: '七成及以下' }
        ],
        selectedCondition: '',
        priceRange: [
            { value: '', label: '全部价格' },
            { value: '0-10', label: '10元以下' },
            { value: '10-30', label: '10-30元' },
            { value: '30-50', label: '30-50元' },
            { value: '50-999', label: '50元以上' }
        ],
        selectedPrice: '',
        showFilter: false
    },

    onLoad(options) {
        if (options.keyword) {
            this.setData({ keyword: options.keyword })
            this.doSearch()
        }
    },

    onInput(e) {
        this.setData({ keyword: e.detail.value })
    },

    onFocus() {
        this.setData({ inputFocus: true })
    },

    onBlur() {
        this.setData({ inputFocus: false })
    },

    onConfirm() {
        this.doSearch()
    },

    toggleFilter() {
        this.setData({ showFilter: !this.data.showFilter })
    },

    selectCollege(e) {
        const college = e.currentTarget.dataset.value
        this.setData({ selectedCollege: this.data.selectedCollege === college ? '' : college })
    },

    selectCondition(e) {
        this.setData({ selectedCondition: e.currentTarget.dataset.value })
    },

    selectPrice(e) {
        this.setData({ selectedPrice: e.currentTarget.dataset.value })
    },

    resetFilter() {
        this.setData({ selectedCollege: '', selectedCondition: '', selectedPrice: '' })
    },

    confirmFilter() {
        this.setData({ showFilter: false })
        this.doSearch()
    },

    async doSearch() {
        const { keyword, selectedCollege, selectedCondition, selectedPrice } = this.data
        if (!keyword.trim() && !selectedCollege && !selectedCondition && !selectedPrice) {
            wx.showToast({ title: '请输入搜索关键词', icon: 'none' })
            return
        }

        this.setData({ loading: true, searched: true })
        try {
            // 使用云函数搜索
            const results = await bookAPI.searchBooks({
                keyword: keyword.trim(),
                college: selectedCollege,
                condition: selectedCondition,
                priceRange: selectedPrice,
                page: 1,
                pageSize: 50
            })
            this.setData({ results: results || [], loading: false })
        } catch (err) {
            console.error('搜索失败:', err)
            // 降级：本地数据库简单搜索
            try {
                const allBooks = await bookAPI.getBooks({ page: 1, pageSize: 100 })
                let filtered = allBooks
                if (keyword.trim()) {
                    const kw = keyword.trim().toLowerCase()
                    filtered = filtered.filter(b =>
                        (b.title && b.title.toLowerCase().includes(kw)) ||
                        (b.author && b.author.toLowerCase().includes(kw)) ||
                        (b.isbn && b.isbn.includes(kw))
                    )
                }
                if (selectedCollege) filtered = filtered.filter(b => b.college === selectedCollege)
                if (selectedCondition) filtered = filtered.filter(b => b.condition === selectedCondition)
                if (selectedPrice) {
                    const [min, max] = selectedPrice.split('-').map(Number)
                    filtered = filtered.filter(b => b.price >= min && b.price <= max)
                }
                this.setData({ results: filtered, loading: false })
            } catch (e2) {
                this.setData({ results: [], loading: false })
                wx.showToast({ title: '搜索失败', icon: 'error' })
            }
        }
    },

    goBookDetail(e) {
        const id = e.currentTarget.dataset.id
        wx.navigateTo({ url: `/pages/book-detail/book-detail?id=${id}` })
    }
})
