<template>
  <div class="page-wrap">
    <div class="top-area">
      <div class="top-title-box">
        <i class="el-icon-star-off top-icon"></i>
        <span class="top-title">烟花效果进度条</span>
      </div>
      <div class="top-desc">
        直观展示烟花燃放过程中的时间、节奏和颜色变化，支持自定义图标、背景色与时长配置
      </div>
    </div>

    <div class="section-wrap">
      <div class="section-head">
        <h2 class="section-main-title">01 图标选择</h2>
        <p class="section-sub-desc">挑选需要用到的烟花图标，勾选即可加入配置库</p>
      </div>

      <div>
        <el-select v-model="selectedType" placeholder="请选择图标类型" :loading="loading" clearable @change="handleTypeChange"
          style="width: 400px; margin: 20px auto; display: block;">
          <el-option v-for="type in iconTypes" :key="type.id" :label="type.typeName" :value="type.id" />
        </el-select>

        <div class="icon-grid">
          <div v-for="icon in iconList" :key="icon.id" class="icon-item" :class="{ selected: isSelected(icon.id) }">
            <el-checkbox class="selection-box" v-model="selectedIcons" :label="icon" @change="handleSelectionChange">
              <br>
            </el-checkbox>
            <img :src="imageBaseUrl + icon.picture" class="icon-image" />
            <div class="icon-name">{{ icon.iconName }}</div>
          </div>
        </div>

        <div class="selected-count" v-if="selectedIcons.length">已选择：{{ selectedIcons.length }} 个图标</div>
      </div>
    </div>

    <div class="section-wrap">
      <div class="section-head">
        <h2 class="section-main-title">02 效果参数配置</h2>
        <p class="section-sub-desc">设置分镜数量、单帧时长，自定义每一段烟花图标、背景与播放模式</p>
      </div>

      <div class="config-area">
        <el-form :inline="true">
          <el-form-item label="数量 (1-10)">
            <el-input-number v-model="config.frameCount" :min="1" :max="10" @change="handleFrameCountChange" />
          </el-form-item>
          <el-form-item label="单个最久（秒）">
            <el-input-number v-model="config.maxSingle" :min="1" />
          </el-form-item>
          <el-form-item label="总时长">
            {{ totalDuration }} 秒
          </el-form-item>
        </el-form>

        <el-table :data="frames" border align="center" style="width: 100%;">
          <el-table-column label="序号" width="60">
            <template #default="{ $index }">
              #{{ $index + 1 }}
            </template>
          </el-table-column>

          <el-table-column label="时长（秒）" width="200">
            <template #default="{ row }">
              <el-input-number v-model="row.duration" :min="1" :max="config.maxSingle" @change="updateDurations" />
            </template>
          </el-table-column>

          <el-table-column v-if="selectedType === 1" label="是否循环" width="130">
            <template #default="{ row }">
              <el-select v-model="row.isLoop" size="mini">
                <el-option label="不循环" :value="false" />
                <el-option label="循环" :value="true" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column v-if="selectedType === 1" label="模式" width="120">
            <template #default="{ row }">
              <el-select v-model="row.mode" size="mini" @change="handleModeChange(row)">
                <el-option label="无" value="" />
                <el-option label="齐发" value="burst" />
                <el-option label="并发" value="concurrency" />
              </el-select>
            </template>
          </el-table-column>

          <el-table-column v-if="selectedType === 1" label="数量" width="150">
            <template #default="{ row }">
              <el-input-number v-if="row.mode === 'burst' || row.mode === 'concurrency'" v-model="row.count" :min="1"
                :max="999" size="mini" />
              <span v-else>—</span>
            </template>
          </el-table-column>

          <el-table-column label="图标设置" align="center" min-width="500">
            <template #default="{ row }">
              <div v-if="!row.icons || row.icons.length === 0" style="color:#999;">
                暂无图标
              </div>

              <div v-for="(item, idx) in row.icons" :key="idx" class="icon-settings-row">
                <div @click="changeSingleIcon(row, idx)"
                  style="cursor:pointer; display:flex; flex-direction:column; align-items:center;">
                  <img :src="imageBaseUrl + item.icon.picture" style="width:32px;height:32px;object-fit:contain;"
                    :class="{ iconWhiteLine: item.isWhiteLine }">
                  <div
                    style="font-size:11px; color:#999; margin-top:3px; width:70px; text-align:center; white-space:nowrap;">
                    点击可更换图标</div>
                  <el-button size="mini" type="text" style="margin-top:4px; padding:2px 6px; font-size:12px;"
                    @click.stop="switchIconLine(item)">{{ item.isWhiteLine ? '切换黑色线条' : '切换白色线条' }}</el-button>
                </div>
                <div
                  style="display:flex; align-items:center; gap:6px; justify-content:center; flex-wrap:wrap; width: 320px">
                  <!-- 第一行：颜色设置标题 -->
  <div style="font-size: 12px; color: #666; margin-bottom: 6px; text-align: center; width: 100%;">
    颜色设置
  </div>

                  <div style="display:flex; align-items:center; gap:6px; width:100%; justify-content:center;">
                    <div v-for="(bg, index) in colorBgImages" :key="index"
                      style="width:32px;height:32px;border-radius:4px;overflow:hidden;cursor:pointer;border:1px solid #ddd;"
                      @click="toggleBgUrl(item, bg.url)">
                      <img :src="bg.url" style="width:100%;height:100%;object-fit:cover;">
                    </div>

                    <div style="position:relative;width:32px;height:32px;">
                      <el-color-picker v-model="item.tempColor" color-format="hex" @change="handleAddColor(item)"
                        style="position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;cursor:pointer;" />
                      <div
                        style="width:32px;height:32px;border-radius:4px;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;background:#fff;">
                        <span style="font-size:18px;color:#666;">+</span>
                      </div>
                    </div>
                  </div>
                  <!-- 第三行：已选颜色标题（有颜色才显示） -->
  <div v-if="item.colorList?.length > 0" 
    style="font-size: 12px; color: #666; margin: 6px 0; text-align: center; width: 100%;">
    已选颜色
  </div>
                  <div class="color-list" style="margin-top:6px; justify-content:center;">
                    <div v-for="(c, cIdx) in item.colorList" :key="cIdx" class="color-item"
                      :style="getColorItemStyle(c)" draggable="true" @dragstart="handleDragStart($event, item, cIdx)"
                      @dragover.prevent @drop="handleDrop($event, item, cIdx)">
                      <i class="el-icon-close" @click.stop="removeColorByIndex(item, cIdx)"></i>
                    </div>
                  </div>

                  <div v-if="item.colorList.length > 1"
                    style="width:100%;text-align:center;font-size:12px;color:#999;margin-top:4px;">
                    长按拖动调整颜色顺序
                  </div>
                </div>
<!-- 底部窄色条 - 三行垂直左对齐（完美版） -->
<div v-if="selectedType === 2" style="margin-left: 10px; width: 320px;">

<!-- 第1行：开关 + 文字 -->
<div style="display: flex; align-items: center; margin-bottom: 8px;">
  <el-switch v-model="item.enableBottomBar" size="mini" />
  <span style="font-size:12px; margin-left: 6px;">底部窄色条</span>
</div>

<!-- 第2行：可选颜色 -->
<div v-if="item.enableBottomBar">
  <!-- 标题：颜色设置 ✅ 左对齐 -->
  <div style="font-size: 12px; color: #666; margin-bottom: 6px; text-align: left;">
      颜色设置
    </div>
  <div style="display: flex; align-items: center; gap: 6px;">
    <div 
      v-for="(bg, index) in colorBgImages" 
      :key="'bot'+index"
      style="width:32px; height:32px; border-radius:4px; overflow:hidden; cursor:pointer; border:1px solid #ddd;"
      @click="toggleBottomBarUrl(item, bg.url)"
    >
      <img :src="bg.url" style="width:100%; height:100%; object-fit:cover;">
    </div>

    <div style="position: relative; width:32px; height:32px;">
      <el-color-picker 
        v-model="item.tempBottomColor" 
        color-format="hex" 
        @change="handleAddBottomColor(item)"
        style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer;"
      />
      <div style="width:32px; height:32px; border-radius:4px; border:1px solid #ddd; display: flex; align-items:center; justify-content:center; background:#fff;">
        <span style="font-size:18px; color:#666;">+</span>
      </div>
    </div>
  </div>
</div>
<!-- 标题：已选颜色 ✅ 选色后才显示 + 左对齐 -->
<div 
      v-if="item.bottomBarColorList.length > 0 && item.enableBottomBar" 
      style="font-size: 12px; color: #666; margin-bottom: 6px; text-align: left;"
    >
      已选颜色
    </div>
<!-- 第3行：已选颜色 ✅ 强制左对齐 和上面完全对齐 -->
<div v-if="item.enableBottomBar" style="padding-left: 0 !important; margin-left: 0 !important;">
  <div 
    class="color-list" 
    style="display: flex; gap: 4px; margin: 0; padding: 0; justify-content: flex-start !important;"
  >
    <div 
      v-for="(c, ci) in (item.bottomBarColorList || [])" 
      :key="'botc'+ci" 
      class="color-item"
      :style="getColorItemStyle(c)"
      draggable="true"
      @dragstart="handleBottomDragStart($event, item, ci)"
      @dragover.prevent
      @drop="handleBottomDrop($event, item, ci)"
    >
      <i class="el-icon-close" @click.stop="removeBottomColor(item, ci)"></i>
    </div>
  </div>
</div>
<div v-if="item.bottomBarColorList.length > 1 && item.enableBottomBar"
                    style="width:100%;text-align:left;font-size:12px;color:#999;margin-top:4px;">
                    长按拖动调整颜色顺序
                  </div>
</div>
                <div class="icon-settings-item">
                  <el-button size="mini" type="danger" @click="removeFrameIcon(row, idx)">
                    <i class="el-icon-close"></i> 删除图标
                  </el-button>
                </div>
              </div>
              <el-button size="mini" type="primary" @click="addFrameIcon(row)" style="margin-top:8px;">
                <i class="el-icon-plus"></i> 添加图标
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div class="section-wrap" v-if="selectedIcons.length">
      <div class="section-head">
        <h2 class="section-main-title">03 实时预览 & 导出下载</h2>
        <p class="section-sub-desc">实时查看烟花进度条整体效果，确认无误后一键下载高清图片</p>
      </div>

      <div class="preview-outer">
        <div class="screenshot-container" ref="screenshotContainer">
          <div class="preview-area">
            <div class="timeline-container">
              <div v-for="(frame, index) in frames" :key="index" class="time-frame" :style="frameStyle(frame)">
                <div class="frame-container" :style="{ backgroundColor: frame.bgColor }">
                  <div class="icon-layer">
                    <div v-for="(item, iconIndex) in frame.icons" :key="iconIndex" class="selectedIcon-item"
                      :style="getIconPosition(frame.icons.length, iconIndex)">
                      <div class="icon-bg-wrap">
  <!-- 主背景区域：开启底部色条自动缩为90%高度，不挤占底部区域 -->
  <div 
    v-for="(c, cIdx) in item.colorList" 
    :key="cIdx" 
    class="color-segment"
    :style="{
      ...getSegmentStyle(c, item.colorList.length),
      height: item.enableBottomBar ? `${(100 / item.colorList.length) * 0.9}%` : `${100 / item.colorList.length}%`,
      position: relative
    }"
  ></div>

<!-- 底部10%独立色条区域：上下分割显示（和主背景一样） -->
<div 
  v-if="selectedType === 2 && item.enableBottomBar && item.bottomBarColorList.length"
  style="position:absolute;left:0;bottom:0;width:100%;height:10%;z-index:1;"
>
  <div 
    v-for="(c,idx) in item.bottomBarColorList" 
    :key="'preBot'+idx"
    :style="getSegmentStyle(c, item.bottomBarColorList.length)"
    style="width:100%;height:auto;"
  ></div>
</div>

  <!-- 图标固定最高层级，永远置顶不被任何图层遮挡 -->
  <img 
    :src="imageBaseUrl + item.icon.picture" 
    class="final-icon-img"
    :class="{ iconWhiteLine: item.isWhiteLine }"
    style="position: absolute; z-index: 9999 !important; left: 0; top: 0;"
  >
</div>
                    </div>
                  </div>
                </div>
                <div v-if="frame.isLoop" class="loop-tag">
                  <img src="@/assets/mode/loop.png" class="loop-img" />
                </div>
                <div v-if="selectedType === 1 && frame.mode" class="mode-tag">
                  <span v-if="frame.count > 1" class="mode-count">X{{ frame.count }}</span>
                  <img :src="frame.modeImage" class="mode-image" :alt="frame.mode">
                </div>
              </div>

              <div class="timeline-axis">
                <div v-for="(mark, index) in filteredTimeMarks" :key="index" class="time-mark-dot"
                  :style="{ left: mark.position + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="download-wrap">
        <el-button type="primary" @click="downloadCombined" class="download-btn">
          <i class="el-icon-download"></i>
          下载效果条
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'
export default {
  data() {
    return {
      tempFrame: null,
      tempSelectedIcon: null,
      dragIndex: -1,
      colorBgImages: [
        { url: require('@/assets/bg/silver.png'), label: '银色' },
        { url: require('@/assets/bg/gold.png'), label: '金色' },
        { url: require('@/assets/bg/rainbow.png'), label: '彩虹色' }
      ],
      selectedType: null,
      iconTypes: [],
      loading: false,
      iconList: [],
      selectedIcons: [],
      imageBaseUrl: process.env.NODE_ENV === 'development' ? 'http://localhost:9090/image/iconPicture/' : 'https://progressbar-production-7a7b.up.railway.app/image/iconPicture/',
      config: {
        frameCount: 5,
        maxSingle: 5
      },
      frames: [],
      modeImageMap: {
        burst: require('@/assets/mode/burst.png'),
        concurrency: require('@/assets/mode/concurrency.png'),
        loop: require('@/assets/mode/loop.png')
      },
      borderRadius: 12,
      containerStyle: {
        padding: '100px',
        backgroundColor: '#ffffff'
      }
    }
  },
  methods: {
    switchIconLine(item) {
      item.isWhiteLine = !item.isWhiteLine
    },
    getColorItemStyle(c) {
      if (c.startsWith('#')) {
        return { backgroundColor: c };
      }
      return { backgroundImage: `url(${c})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    },
    getSegmentStyle(c, len) {
      const base = { height: `${100 / len}%`, width: '100%' };
      if (c.startsWith('#')) {
        return { ...base, backgroundColor: c };
      }
      return { ...base, backgroundImage: `url(${c})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    },
    fetchIconTypes() {
      try {
        this.loading = true;
        this.request.get('/icontype').then((res) => {
          this.iconTypes = res
        });
      } catch (error) {
        console.error('获取图标类型失败:', error);
        this.$message.error('获取图标类型失败');
      } finally {
        this.loading = false;
      }
    },
    handleTypeChange(e) {
      let typeId = e;
      this.request.get('/icon/getIcons/' + typeId).then(res => {
        this.iconList = res.data.message;
      })
      this.selectedIcons = []
      this.selectedType = typeId
    },
    isSelected(id) {
      return this.selectedIcons.includes(id)
    },
    toggleSelection(id) {
      const index = this.selectedIcons.indexOf(id)
      if (index > -1) {
        this.selectedIcons.splice(index, 1)
      } else {
        this.selectedIcons.push(id)
      }
    },
    handleSelectionChange(val) { },
    frameStyle(frame) {
      return {
        width: `${(frame.duration / this.totalDuration) * 100}%`
      }
    },
    openMultiIconSelect(row) {
      if (this.selectedIcons.length === 0) {
        this.$message.warning('请先在上方选择图标库')
        return
      }
      this.tempFrame = row
      this.$alert('', '选择图标（点击切换）', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '保存',
        customClass: 'multi-icon-panel',
        message: `<div id="iconSelectPanel" style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 280px; overflow-y: auto;">${this.selectedIcons.map(icon => {
          const isSelected = row.icons.some(i => i.id === icon.id)
          return `<div data-id="${icon.id}" style="width:48px; height:48px; border-radius:6px; padding:4px; cursor: pointer; border: 2px solid ${isSelected ? '#409EFF' : '#eee'}; background: ${isSelected ? '#e8f4ff' : '#fff'};"><img src="${this.imageBaseUrl + icon.picture}" style="width:100%; height:100%; object-fit:contain;"></div>`
        }).join('')}</div>`
      }).then(() => {
        const nodes = document.querySelectorAll('#iconSelectPanel [data-id]')
        const selectedIcons = []
        nodes.forEach(node => {
          if (node.style.borderColor === 'rgb(64, 158, 255)') {
            const id = Number(node.dataset.id)
            const icon = this.selectedIcons.find(i => i.id === id)
            if (icon) selectedIcons.push(icon)
          }
        })
        this.tempFrame.icons = selectedIcons
      })
      setTimeout(() => {
        document.querySelectorAll('#iconSelectPanel [data-id]').forEach(node => {
          node.onclick = () => {
            if (node.style.borderColor === 'rgb(64, 158, 255)') {
              node.style.borderColor = '#eee'
              node.style.background = '#fff'
            } else {
              node.style.borderColor = '#409EFF'
              node.style.background = '#e8f4ff'
            }
          }
        })
      }, 100)
    },
    changeSingleIcon(row, idx) {
      if (!this.selectedIcons.length) {
        this.$message.warning("请先在上方选择图标")
        return
      }
      const currentIconId = row.icons[idx].icon.id
      this.tempSelectedIcon = null
      this.$alert('', '更换图标', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '完成',
        showCancelButton: true,
        cancelButtonText: '取消',
        message: `<div id="iconSelectWrap" style="display: flex; flex-wrap: wrap; gap: 8px; max-height: 280px; overflow-y: auto; padding: 10px;">${this.selectedIcons.map(icon => `<div data-id="${icon.id}" style="width: 50px; height: 50px; border: 2px solid ${icon.id === currentIconId ? '#409EFF' : '#ddd'}; border-radius: 6px; padding: 4px; cursor: pointer; background: ${icon.id === currentIconId ? '#f0f7ff' : '#fff'};"><img src="${this.imageBaseUrl}${icon.picture}" style="width: 100%; height: 100%; object-fit: contain;"></div>`).join('')}</div>`
      }).then(() => {
        if (this.tempSelectedIcon) {
          row.icons[idx].icon = this.tempSelectedIcon
          this.$message.success('已更换图标！')
        }
      }).catch(() => {
        this.tempSelectedIcon = null
      })
      setTimeout(() => {
        const items = document.querySelectorAll('#iconSelectWrap [data-id]')
        items.forEach(el => {
          el.onclick = () => {
            items.forEach(i => {
              i.style.border = '2px solid #ddd'
              i.style.background = '#fff'
            })
            el.style.border = '2px solid #409EFF'
            el.style.background = '#f0f7ff'
            const id = Number(el.dataset.id)
            this.tempSelectedIcon = this.selectedIcons.find(i => i.id === id)
          }
        })
      }, 100)
    },
    removeFrameIcon(row, idx) {
      row.icons.splice(idx, 1);
    },
    addFrameIcon(row) {
      if (!this.selectedIcons.length) {
        this.$message.warning("请先选择图标");
        return;
      }
      let defaultIcon = this.selectedIcons[0];
      row.icons.push({
        icon: defaultIcon,
        tempColor: "#ffffff",
        colorList: [],
        isWhiteLine: false,
        enableBottomBar: false,
  tempBottomColor: "#ffffff",
  bottomBarColorList: []
      })
    },
    // 底部色条专用方法 纯新增
    toggleBottomBarUrl(item, url) {
  const i = item.bottomBarColorList.indexOf(url);
  i > -1 ? item.bottomBarColorList.splice(i, 1) : item.bottomBarColorList.push(url);
},
handleAddBottomColor(item) {
  if (!item.tempBottomColor.startsWith('#')) return;
  if (!item.bottomBarColorList.includes(item.tempBottomColor)) {
    item.bottomBarColorList.push(item.tempBottomColor);
  }
},
removeBottomColor(item, idx) {
  item.bottomBarColorList.splice(idx, 1);
},
// 底部色条拖拽
handleBottomDragStart(e, item, idx) {
  this.dragIndex = idx;
  e.dataTransfer.effectAllowed = "move";
},
handleBottomDrop(e, item, idx) {
  if (this.dragIndex === idx) return;
  const list = item.bottomBarColorList;
  const moved = list.splice(this.dragIndex, 1)[0];
  list.splice(idx, 0, moved);
  this.dragIndex = -1;
},
    assignUniqueIcons() {
      this.frames.forEach(frame => {
        frame.icons = []
        const availableIcons = this.shuffleArray([...this.selectedIcons])
        const maxIcons = Math.min(availableIcons.length, this.calculateMaxIcons(frame))
        const iconCount = availableIcons.length > 0 ? Math.max(1, Math.floor(Math.random() * 5)) : 0
        const uniqueIcons = new Set()
        while (uniqueIcons.size < iconCount && availableIcons.length > 0) {
          const icon = availableIcons.pop()
          if (!uniqueIcons.has(icon.id)) {
            uniqueIcons.add(icon.id)
            frame.icons.push({
              icon: icon,
              tempColor: "#ffffff",
              colorList: [],
              isWhiteLine: false,
              // 👇 只加这三行，解决报错！
  enableBottomBar: false,
  tempBottomColor: "#ffffff",
  bottomBarColorList: []
            })
          }
        }
      })
    },
    calculateMaxIcons(frame) {
      const baseSize = 100
      const iconArea = 30 * 30
      return Math.floor((baseSize * baseSize) / iconArea)
    },
    shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5)
    },
    getIconPosition(totalIcons, index) {
      if (totalIcons === 0) return {}
      const height = 100 / totalIcons
      const top = index * height
      return {
        top: `${top}%`,
        height: `${height}%`,
        left: '0%',
        width: '100%',
        margin: '0',
        padding: '0',
        transform: 'none'
      }
    },
    randomPosition() {
      return {
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 80}%`,
        width: `${15 + Math.random() * 15}%`
      }
    },
    isPositionValid(frame, newPos) {
      const MARGIN = 5
      return !frame.positions?.some(existing => {
        return this.checkCollision(existing, newPos, MARGIN)
      })
    },
    checkCollision(pos1, pos2, margin) {
      const rect1 = {
        left: parseFloat(pos1.left) - margin,
        top: parseFloat(pos1.top) - margin,
        right: parseFloat(pos1.left) + parseFloat(pos1.width) + margin,
        bottom: parseFloat(pos1.top) + parseFloat(pos1.width) + margin
      }
      const rect2 = {
        left: parseFloat(pos2.left) - margin,
        top: parseFloat(pos2.top) - margin,
        right: parseFloat(pos2.left) + parseFloat(pos2.width) + margin,
        bottom: parseFloat(pos2.top) + parseFloat(pos2.width) + margin
      }
      return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)
    },
    getIconStyle(icons, index) {
      return {
        height: `${100 / icons.length}%`,
        top: `${index * (100 / icons.length)}%`,
        width: '70%',
        left: '15%'
      }
    },
    handleFrameCountChange(newVal) {
      this.frames = Array.from({ length: newVal }, (_, i) =>
        this.frames[i] || {
          id: i + 1,
          duration: 1,
          backgroundColor: '#ffffff'
        }
      )
    },
    updateDurations() {
      if (this.totalDuration === 0) {
        this.frames.forEach(frame => frame.duration = 1)
      }
    },
    initFrames() {
      this.frames = Array.from({ length: this.config.frameCount }, (_, i) => ({
        id: i + 1,
        duration: 1,
        mode: '',
        modeImage: '',
        isLoop: false,
        count: 1,
        icons: [],
        bgColor: '#c6e4e9'
      }))
      this.assignUniqueIcons()
    },
    handleModeChange(frame) {
      frame.modeImage = this.modeImageMap[frame.mode]
    },
    getRandomColor() {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    generateLayout(frame) {
      const elementCount = frame.mode === 'burst' ? frame.colors.length : Math.max(3, frame.colors.length)
      return Array.from({ length: elementCount }, (_, i) => ({
        color: frame.colors[i % frame.colors.length],
        height: `${100 / elementCount}%`,
        top: `${(i * 100) / elementCount}%`
      }))
    },
    removeColor(frame, index) {
      if (frame.colors.length > 1) {
        frame.colors.splice(index, 1)
      } else {
        this.$message.warning("至少需要保留一个颜色")
      }
    },
    toggleBgUrl(item, url) {
      const index = item.colorList.indexOf(url);
      if (index > -1) {
        item.colorList.splice(index, 1);
      } else {
        item.colorList.push(url);
      }
    },
    handleAddColor(item) {
      const val = item.tempColor;
      if (!val || !val.startsWith('#')) return;
      if (item.colorList.includes(val)) return;
      item.colorList.push(val);
    },
    removeColorByIndex(item, idx) {
      item.colorList.splice(idx, 1)
    },
    handleDragStart(e, item, idx) {
      this.dragIndex = idx
      e.dataTransfer.effectAllowed = "move"
    },
    handleDrop(e, item, idx) {
      if (this.dragIndex === idx) return
      const list = item.colorList
      const moved = list.splice(this.dragIndex, 1)[0]
      list.splice(idx, 0, moved)
      this.dragIndex = -1
    },
    async downloadCombined() {
  try {
    const container = this.$refs.screenshotContainer;
    const imgs = container.querySelectorAll('.final-icon-img');
    let idx = 0;
    const originalSrcList = [];

    // 保存原图地址，同时把跨域图片转为 Data URL
    const convertPromises = [];
    imgs.forEach(img => {
      originalSrcList.push(img.src);
      // 把图片转成 Data URL，避开跨域
      convertPromises.push(new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', img.src);
        xhr.responseType = 'blob';
        xhr.onload = function() {
          const reader = new FileReader();
          reader.onloadend = function() {
            img.src = reader.result; // 替换为本地 Data URL
            resolve();
          };
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function() {
          resolve(); // 即使失败也继续执行
        };
        xhr.send();
      }));
    });

    // 等待所有图片转成 Data URL
    await Promise.all(convertPromises);

    // 处理白线图标（你原来的代码，一行都不动）
    const promises = [];
    this.frames.forEach(frame => {
      frame.icons.forEach(item => {
        const img = imgs[idx];
        if (img && item.isWhiteLine) {
          const p = new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const image = new Image();
            image.crossOrigin = 'Anonymous';
            image.onload = () => {
              canvas.width = image.width;
              canvas.height = image.height;
              ctx.drawImage(image, 0, 0);
              ctx.globalCompositeOperation = 'source-in';
              ctx.fillStyle = '#FFF';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              img.src = canvas.toDataURL('image/png');
              resolve();
            };
            image.src = img.src; // 用已经转好的 Data URL
          });
          promises.push(p);
        }
        idx++;
      });
    });

    await Promise.all(promises);
    await new Promise(r => setTimeout(r, 20));

    // ==================== 真正解决变形：只加这一段，不破坏任何东西 ====================
    imgs.forEach(img => {
      img.setAttribute('width', img.naturalWidth);
      img.setAttribute('height', img.naturalHeight);
      img.style.cssText += 'position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); width:auto; height:auto; max-width:100%; max-height:100%;';
    });
    await this.$nextTick();
    // =================================================================================

    // 截图（此时图片已经是本地 Data URL，无跨域问题）
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      backgroundColor: null
    });

    // 恢复（完全恢复成你原来的样子）
    idx = 0;
    imgs.forEach(img => {
      img.src = originalSrcList[idx++];
      img.removeAttribute('width');
      img.removeAttribute('height');
      img.style.width = '';
      img.style.height = '';
      img.style.maxWidth = '';
      img.style.maxHeight = '';
      img.style.left = '';
      img.style.top = '';
      img.style.transform = '';
    });

    // 下载
    const link = document.createElement('a');
    link.download = "烟花效果_" + Date.now() + ".png";
    link.href = canvas.toDataURL('image/png');
    link.click();

    this.$message.success("导出成功 ✅");
  } catch (err) {
    console.error(err);
    this.$message.error("导出失败");
  }
},
    applyRoundedCorners(sourceCanvas) {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const radius = this.borderRadius * 2
      canvas.width = sourceCanvas.width
      canvas.height = sourceCanvas.height
      ctx.beginPath()
      ctx.moveTo(radius, 0)
      ctx.lineTo(canvas.width - radius, 0)
      ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius)
      ctx.lineTo(canvas.width, canvas.height - radius)
      ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height)
      ctx.lineTo(radius, canvas.height)
      ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius)
      ctx.lineTo(0, radius)
      ctx.quadraticCurveTo(0, 0, radius, 0)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(sourceCanvas, 0, 0)
      return canvas
    }
  },
  computed: {
    totalDuration() {
      return this.frames.reduce((sum, frame) => sum + frame.duration, 0)
    },
    timeMarks() {
      return Array.from({ length: 11 }, (_, i) => ({
        time: (this.totalDuration * i / 10).toFixed(1),
        position: i * 10
      }))
    },
    filteredTimeMarks() {
      return this.timeMarks.filter((item, index) => index !== 0 && index !== this.timeMarks.length - 1)
    }
  },
  watch: {
    'config.frameCount'(newVal) {
      this.initFrames()
      this.assignUniqueIcons()
    },
    selectedIcons: {
      handler() {
        this.assignUniqueIcons()
      },
      deep: true
    }
  },
  created() {
    this.fetchIconTypes();
    this.initFrames()
  },
};
</script>

<style scoped>
.iconWhiteLine {
  filter: invert(1) brightness(2);
}
.icon-bg-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.final-icon-img {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  box-sizing: border-box;
  transform: translateZ(0);
  margin: 0;
  padding: 0;
}
.iconWhiteLine {
  filter: invert(1) brightness(10);
}
.iconWhiteLineSelf {
  filter: invert(1) brightness(10);
}
.page-wrap {
  background: linear-gradient(180deg, #f0f7ff 0%, #f0fff8 100%);
  min-height: 100vh;
}
.section-wrap {
  max-width: 1200px;
  margin: 0 auto 80px;
  padding: 0 20px;
}
.section-head {
  text-align: center;
  margin-bottom: 40px;
}
.section-main-title {
  font-size: 26px;
  font-weight: 600;
  color: #1d1d1f;
  margin: 0 0 8px;
  letter-spacing: 1px;
}
.section-sub-desc {
  font-size: 15px;
  color: #86868b;
  margin: 0;
}
.top-area {
  padding: 60px 20px;
  text-align: center;
  background: transparent;
  margin: 0 auto 60px;
  width: 100%;
  max-width: 1200px;
}
.top-title-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}
.top-icon {
  font-size: 40px;
  color: #007aff;
  margin-bottom: 16px;
}
.top-title {
  font-size: 36px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
}
.top-desc {
  font-size: 17px;
  color: #86868b;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.icon-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
  padding: 0 20px 40px;
}
.icon-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
  cursor: pointer;
}
.icon-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}
.icon-item.selected {
  background: #f0f7ff;
  border: 1px solid #007aff;
}
.selection-box {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}
.icon-image {
  width: 64px;
  height: 64px;
  object-fit: contain;
  margin-bottom: 12px;
}
.icon-name {
  font-size: 13px;
  color: #86868b;
  text-align: center;
  line-height: 1.4;
}
.selected-count {
  text-align: center;
  padding: 16px 0;
  color: #007aff;
  font-weight: 500;
  font-size: 15px;
}
.config-area {
  margin: 0 auto;
  padding: 40px;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.04);
  width: 100%;
}
.el-form {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.el-form-item__label {
  color: #1d1d1f;
  font-weight: 500;
}
:deep(.el-table) {
  border: none;
  border-radius: 16px;
  overflow: hidden;
  background-color: #c6e4e9 !important;
}
:deep(.el-table th) {
  background-color: #f5f5f7 !important;
  color: #1d1d1f !important;
  font-weight: 500;
  border: none;
}
:deep(.el-table__row) {
  background-color: transparent !important;
}
:deep(.el-table td) {
  border: none;
  border-bottom: 1px solid #f2f2f7;
  vertical-align: middle !important;
  background-color: transparent !important;
  border-color: #f2f2f7;
}
:deep(.el-table tr:hover td) {
  background-color: #b9d5da !important;
}
.icon-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  margin: 8px 0;
}
.icon-settings-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.color-list {
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 6px;
  justify-content: center;
}
.color-item {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: move;
  position: relative;
  border: 1px solid #ddd;
  background-size: cover;
  background-position: center;
}
.color-item .el-icon-close {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 14px;
  height: 14px;
  background: #f56c6c;
  color: #fff;
  border-radius: 50%;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.color-bg-active {
  border: 2px solid #007aff !important;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  border-radius: 6px;
}
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
}
.preview-outer {
  display: flex;
  justify-content: center;
  padding: 0 0 40px;
}
.screenshot-container {
  width: 1200px;
  height: 250px;
  overflow: hidden;
  position: relative;
  background: transparent;
  border-radius: 16px;
  box-shadow: none;
  border: 3px solid #000;
}
:deep(.screenshot-container),
:deep(.timeline-container) {
  background-color: #c6e4e9;
}
.preview-area {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
}
.timeline-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 16px;
}
.time-frame {
  height: 100%;
  display: inline-block;
  border-left: 3px solid #000;
  transition: width 0.3s ease;
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.time-frame:first-child {
  border-left: none;
}
.frame-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.icon-layer {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
.selected-icon-item {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
.timeline-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
}
.time-mark-dot {
  position: absolute;
  bottom: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #1d1d1f;
  transform: translateX(-50%);
}
.mode-tag {
  position: absolute;
  bottom: 1px;
  right: 1px;
  color: #fff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 999 !important;
  display: flex;
  align-items: center;
  gap: 4px;
}
.mode-image {
  width: 25px;
  height: 25px;
  object-fit: contain;
  display: block;
}
.loop-tag {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 999;
}
.loop-img {
  width: 26px;
  height: 26px;
  object-fit: contain;
  padding: 4px;
}
.mode-count {
  font-weight: bold;
  font-size: 20px;
  color: #000;
  margin-right: 2px;
}
.download-wrap {
  text-align: center;
}
.download-btn {
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 500;
  background-color: #007aff;
  border: none;
  border-radius: 12px;
  color: white;
  transition: all 0.2s ease;
}
.download-btn:hover {
  background-color: #0066cc;
  transform: scale(1.02);
}
</style>