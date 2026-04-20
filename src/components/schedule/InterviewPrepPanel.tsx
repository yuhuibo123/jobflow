import { Building2, ListChecks } from 'lucide-react';

export function InterviewPrepPanel() {
  return (
    <div className="bg-white rounded-2xl border border-[#F0EBE4] p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-[#6B5E4E]" />
            <h3 className="text-[#1C1917] font-bold">下一场面试准备</h3>
          </div>
          <p className="text-[#9C8B78] text-sm">小红书 HR 电话沟通，先把底线和偏好说清楚。</p>
        </div>
        <span className="bg-[#FFF7CC] border border-[#FFE36A] text-[#7A5A00] text-xs px-2.5 py-1 rounded-full font-medium">
          今天 16:30
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { title: '公司信息', desc: '内容社区、电商和本地生活都在扩，岗位需要能讲清业务判断。' },
          { title: '常见问题', desc: '为什么换方向、期望城市、薪资底线、能不能尽快入职。' },
          { title: '准备重点', desc: '用 2 个项目证明你能把用户问题拆成产品动作。' },
        ].map((item) => (
          <div key={item.title} className="rounded-xl bg-[#FBF8F3] border border-[#F0EBE4] p-4">
            <div className="text-[#1C1917] text-sm font-semibold mb-2">{item.title}</div>
            <p className="text-[#6B5E4E] text-xs leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-[#F5F0EA] pt-4">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks size={16} className="text-[#6B5E4E]" />
          <h3 className="text-[#1C1917] font-bold">面试前检查</h3>
        </div>
        <div className="space-y-2">
          {['确认设备和网络', '准备 60 秒自我介绍', '写下 2 个反问问题'].map((item, index) => (
            <div key={item} className="flex items-center gap-2 text-sm">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                index === 0 ? 'bg-[#DCFCE7] text-[#16A34A]' : 'bg-[#F5F0EA] text-[#9C8B78]'
              }`}>
                {index === 0 ? '✓' : index + 1}
              </span>
              <span className="text-[#6B5E4E]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
