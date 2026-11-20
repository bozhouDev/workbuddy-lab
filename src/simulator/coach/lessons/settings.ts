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
        '装好 WorkBuddy 别急着往里拖文件。先花 1 分钟调两个开关，能省掉后面一大堆麻烦：',
        '一是<b>把默认存储路径挪出 C 盘</b>，不然用两个月系统盘就红；二是<b>打开桌面通知</b>，长任务干完会叫你，不用干瞪眼。',
      ],
      buttons: [{ label: '好，跟我去调设置', primary: true }],
    },
    {
      id: 'open-avatar',
      phase: 1,
      say: ['设置藏在左下角头像里。点左下角蓝圈里的<b>头像</b>，把菜单弹出来。'],
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
      say: ['菜单里能直接看套餐和积分余额。点下面的<b>设置</b>，默认就会进到「通用」页。'],
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
      say: [
        '这里完整还原了 5.11.3 的「通用」设置页（常规 / 权限 / 存储 / 通知 / 隐私）——<b>上面的字体、代理、锁屏、自动更新等任意开关你都可以随便点</b>，点哪项我用大白话讲哪项。',
        '咱们重点亲手调两项：先看「存储」这一块，默认路径在 <code>C:\\Users\\Administrator\\WorkBuddy</code>，用久了很容易撑爆 C 盘。点右侧的<b>更改</b>挪到 <code>D:\\WorkBuddy-工作区</code>。',
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
      say: [
        '干得好——路径一挪，空间一下宽裕了，而且以后所有新任务和分组都会自动落进你熟悉的位置，好找又好清理。',
        '再往下看「通知」：复杂任务常要跑一两分钟，点<b>前往系统设置 ↗</b> 把桌面通知打开，干完活它会弹窗叫你回来验收。',
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
        { label: '下一节：1.2 分组与文件夹 →', primary: true, nextLesson: 'groups' },
        { label: '读本节图文教程', href: '/features/setup/settings/' },
        { label: '重来一遍', restart: true },
      ],
    },
  ],
};
