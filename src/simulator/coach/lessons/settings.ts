import type { GuidedLessonDef } from '../guidedTypes';
import { createBaseGuidedState } from './baseState';

export const settingsLesson: GuidedLessonDef = {
  id: 'settings',
  code: '1.1',
  title: '系统设置',
  guideUrl: '/features/setup/settings/',
  initialState: () =>
    createBaseGuidedState({
      storagePath: 'C:\\Users\\Administrator\\WorkBuddy',
      storageMoved: false,
      notifyEnabled: false,
    }),
  steps: [
    {
      id: 'intro',
      phase: 0,
      say: [
        '装好 WorkBuddy 别急着往里拖文件。先花 1 分钟调两项基础设置，能省掉后面一大堆麻烦：',
        '一是<b>把默认存储路径挪出 C 盘</b>，不然用两个月系统盘就红；二是<b>打开桌面通知</b>，长任务干完会叫你，不用干瞪眼。',
      ],
      buttons: [{ label: '好，跟我去调设置', primary: true }],
    },
    {
      id: 'open-avatar',
      phase: 1,
      navLabel: '头像',
      say: ['设置藏在左下角头像里，顺着下面的蓝圈一路点进去就行：'],
      wait: {
        target: 'avatar',
        callout: '点左下角头像',
        label: '左下角头像',
      },
      onAction: () => ({ popover: 'avatar' }),
    },
    {
      id: 'open-settings',
      phase: 1,
      navLabel: '设置',
      say: [],
      wait: {
        target: 'avatarMenu.settings',
        callout: '点这里进设置',
        label: '设置',
      },
      onAction: () => ({ popover: null, view: 'settings', settingsTab: 'general' }),
    },
    {
      id: 'move-storage',
      phase: 1,
      navLabel: '挪出 C 盘',
      say: [
        '左边完整还原了 5.11.3 的<b>通用</b>设置页（常规 / 权限 / 存储 / 通知 / 隐私）——<b>字体、网络代理、锁屏、自动更新等任意开关你都能随便点</b>，点哪项我用大白话告诉你它是干嘛的。',
        '先调第一项重点：看<b>存储</b>，默认路径在 <code>C:\\Users\\Administrator\\WorkBuddy</code>，点右侧<b>更改</b>把它挪到独立工作盘。',
      ],
      wait: {
        target: 'settings.changePath',
        callout: '点更改挪出 C 盘',
        label: '更改存储路径',
      },
      onAction: () => ({
        storagePath: 'D:\\WorkBuddy-工作区',
        storageMoved: true,
      }),
    },
    {
      id: 'enable-notify',
      phase: 2,
      navLabel: '开桌面通知',
      say: [
        '干得好——路径一挪，空间立刻宽裕，以后新建任务和分组都会自动存进 <code>D:\\WorkBuddy-工作区</code>。',
        '再调第二项：复杂任务常要跑一两分钟，点<b>桌面通知</b>右侧的<b>前往系统设置 ↗</b> 打开提醒。',
      ],
      wait: {
        target: 'settings.enableNotify',
        callout: '打开桌面通知',
        label: '开启桌面通知',
      },
      onAction: () => ({ notifyEnabled: true }),
    },
    {
      id: 'summary',
      phase: 3,
      say: [
        '通用设置 5 项底子全部理顺了。一句话记住：<b>第一天就把存储挪出 C 盘、打开桌面通知；防休眠和技能自动更新保持默认开启，锁屏运行用得到再开。</b>',
      ],
      card: {
        kind: 'table',
        title: '通用设置 5 项速查',
        headers: ['设置项', '建议', '原因'],
        rows: [
          ['默认存储路径', '挪出 C 盘', '防止文档、项目越积越多撑爆系统盘'],
          ['桌面通知', '打开授权', '长任务干完自动弹窗叫你，不用干等'],
          ['防系统休眠', '保持开启', '防止跑长任务中途电脑自己睡着'],
          ['技能自动更新', '保持开启', '自动修 Skill bug，不覆盖你自己改的'],
          ['允许锁屏运行', '按需开启', '手机远程遥控电脑干活时才需要开'],
        ],
      },
      buttons: [
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
