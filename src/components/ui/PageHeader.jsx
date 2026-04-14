export default function PageHeader({ title, description, actions }) {
  return (
    <div className='flex items-center justify-between mb-6'>
      <div>
        <h1 className='text-2xl font-bold'>{title}</h1>

        {description && (
          <p className='text-sm text-slate-500 mt-1'>{description}</p>
        )}
      </div>

      {actions && <div>{actions}</div>}
    </div>
  );
}
