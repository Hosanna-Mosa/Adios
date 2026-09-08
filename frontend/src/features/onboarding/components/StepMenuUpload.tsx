import { Icon } from "../../../components/shared/Icon";
import { FileUploader } from "../../../components/shared/FileUploader";
import { ItemForm } from "./ItemForm";
import { MenuPreviewTable } from "./MenuPreviewTable";
import { MENU_UPLOAD_COLUMNS, MENU_TEMPLATE_FILE } from "../constants";
import type { useOnboardingForm } from "../hooks/useOnboardingForm";

type Props = { form: ReturnType<typeof useOnboardingForm> };

export function StepMenuUpload({ form }: Props) {
  const {
    isMeatPartner, copy, partnerType,
    menuSetupMode, setMenuSetupMode, menuReferenceFile, validateMenuReferenceFile,
    menuUploadError, menuUploadValid, menuUploadRows,
    menuCategories, setMenuCategories, setEditingItem,
    showCategoryDialog, setShowCategoryDialog, newCategoryName, setNewCategoryName, addCategory,
    editingItem,
  } = form;
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-brand-kinetic/10 flex items-center justify-center">
          <Icon name="menu_book" className="text-base text-brand-kinetic" />
        </div>
        <h2 className="font-display text-lg font-bold">{copy.menuTitle}</h2>
      </div>

      <div className="space-y-5">
      {/* Setup Mode Toggle */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <label className="block text-sm font-semibold mb-3">
          How would you like to set up your {isMeatPartner ? "product list" : "menu"}?
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setMenuSetupMode("manual")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
              menuSetupMode === "manual"
                ? "bg-brand-kinetic text-white border-brand-kinetic"
                : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
            }`}
          >
            <Icon name="edit_note" className="text-lg" />
            Add Items Manually
          </button>
          <button
            type="button"
            onClick={() => setMenuSetupMode("upload")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border text-sm font-semibold transition-all ${
              menuSetupMode === "upload"
                ? "bg-brand-kinetic text-white border-brand-kinetic"
                : "bg-white text-secondary-app border-gray-200 hover:border-brand-kinetic/30"
            }`}
          >
            <Icon name="upload_file" className="text-lg" />
            Upload {isMeatPartner ? "Product" : "Menu"} Reference
          </button>
        </div>
        {menuSetupMode === "upload" && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand-kinetic/20 bg-brand-kinetic/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-brand-kinetic shadow-sm">
                <Icon name="table_view" className="text-lg" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Spreadsheet example</p>
                <p className="mt-1 text-xs text-secondary-app">
                  Use this template and keep the same columns. Item photos are uploaded below after the sheet is read.
                </p>
              </div>
            </div>
            <a
              href={MENU_TEMPLATE_FILE}
              download
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-brand-kinetic/30 bg-white px-4 py-2 text-xs font-semibold text-brand-kinetic transition-all hover:bg-brand-kinetic/10"
            >
              <Icon name="download" className="text-base" />
              Download template
            </a>
          </div>
        )}
      </div>

      {/* Upload Mode */}
      {menuSetupMode === "upload" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <FileUploader
            label={isMeatPartner ? "Upload Your Product Sheet" : "Upload Your Menu"}
            desc={`Upload your completed CSV or XLSX ${isMeatPartner ? "product" : "menu"} spreadsheet`}
            file={menuReferenceFile}
            onChange={validateMenuReferenceFile}
            accept=".csv,.xlsx"
          />
          <p className="mt-3 text-xs text-secondary-app">
            Required columns: {MENU_UPLOAD_COLUMNS.join(", ")}
          </p>
          {menuUploadError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
              <Icon name="error" className="text-base" />
              {menuUploadError}
            </div>
          )}
          {menuUploadValid && menuReferenceFile && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
              <Icon name="check_circle" className="text-base" />
              Sheet accepted. Add item images below to continue.
            </div>
          )}
          <MenuPreviewTable form={form} />
          <div className="mt-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-start gap-3">
              <Icon name="info" className="text-lg text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Our team will handle the rest</p>
                <p className="text-xs text-blue-600 mt-1">
                  Once you submit your application, our onboarding specialist will review your sheet and item images, verify pricing, and set everything up for you within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode — Menu Builder */}
      {menuSetupMode === "manual" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <label className="text-sm font-semibold">
                  {isMeatPartner ? "Product Categories & Items" : "Menu Categories & Items"}
                </label>
                <p className="text-xs text-secondary-app mt-1">{copy.manualCategoryHelp}</p>
              </div>
              {menuCategories.length > 0 && (
                <span className="text-xs font-semibold text-secondary-app bg-gray-100 px-3 py-1 rounded-full">
                  {menuCategories.reduce((sum, c) => sum + c.items.length, 0)} item{menuCategories.reduce((sum, c) => sum + c.items.length, 0) !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Empty State */}
            {menuCategories.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Icon name="restaurant_menu" className="text-3xl text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-on-surface mb-1">{copy.manualEmptyTitle}</p>
                <p className="text-xs text-secondary-app mb-5">{copy.manualEmptyHelp}</p>
              </div>
            ) : (
              /* Category + Item List */
              <div className="space-y-3 mb-5">
                {menuCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Category Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <Icon name="category" className="text-lg text-brand-kinetic" />
                        <div>
                          <p className="text-sm font-semibold">{category.name}</p>
                          <p className="text-xs text-secondary-app">{category.items.length} item{category.items.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingItem({ categoryId: category.id })}
                          className="flex items-center gap-1 text-xs font-semibold text-brand-kinetic hover:text-brand-kinetic/80 transition-colors px-2 py-1 rounded-lg hover:bg-brand-kinetic/5"
                        >
                          <Icon name="add" className="text-base" />
                          Add Item
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuCategories(menuCategories.filter((c) => c.id !== category.id))}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Icon name="delete_outline" className="text-lg" />
                        </button>
                      </div>
                    </div>

                    {/* Items list */}
                    {category.items.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {category.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 transition-colors">
                            {/* Veg/Non-veg indicator */}
                            <span className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center shrink-0 ${
                              item.isVeg
                                ? 'border-green-500 bg-green-50'
                                : 'border-red-500 bg-red-50'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                item.isVeg ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                            </span>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate">{item.name}</p>
                                {item.isBestseller && (
                                  <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">Bestseller</span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-secondary-app truncate">{item.description}</p>
                              )}
                            </div>

                            <p className="text-sm font-bold text-on-surface">₹{item.price}</p>

                            <button
                              type="button"
                              onClick={() => setEditingItem({ categoryId: category.id, item })}
                              className="p-1.5 text-gray-400 hover:text-brand-kinetic transition-colors rounded-lg hover:bg-gray-100"
                            >
                              <Icon name="edit" className="text-base" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-5 text-center">
                        <p className="text-xs text-secondary-app">No items in this category yet. Click "Add Item" to add one.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Category Button */}
            <button
              type="button"
              onClick={() => setShowCategoryDialog(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-secondary-app hover:border-brand-kinetic/30 hover:text-brand-kinetic transition-all"
            >
              <Icon name="add" className="text-lg" />
              Add Category
            </button>
          </div>

          {showCategoryDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold">Add Category</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryDialog(false);
                      setNewCategoryName("");
                    }}
                    className="text-gray-400 hover:text-on-surface transition-colors"
                  >
                    <Icon name="close" className="text-xl" />
                  </button>
                </div>
                <label className="block text-sm font-semibold mb-2">
                  Category Name <span className="text-brand-kinetic">*</span>
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addCategory();
                  }}
                  placeholder="e.g. Starters"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white outline-none focus:border-brand-kinetic focus:ring-2 focus:ring-brand-kinetic/10 transition-all text-sm"
                  autoFocus
                />
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryDialog(false);
                      setNewCategoryName("");
                    }}
                    className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-secondary-app hover:text-on-surface transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={addCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-5 py-3 rounded-xl bg-brand-kinetic text-white text-sm font-semibold hover:bg-brand-kinetic/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Item Panel */}
          {editingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white rounded-2xl border border-gray-200 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold">
                  {editingItem.item ? "Edit Item" : "Add New Item"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="text-gray-400 hover:text-on-surface transition-colors"
                >
                  <Icon name="close" className="text-xl" />
                </button>
              </div>

              <ItemForm
                initialItem={editingItem.item}
                partnerType={partnerType}
                onSave={(item) => {
                  setMenuCategories(
                    menuCategories.map((cat) => {
                      if (cat.id !== editingItem.categoryId) return cat;
                      if (editingItem.item) {
                        // Edit existing
                        return {
                          ...cat,
                          items: cat.items.map((i) => (i.id === item.id ? item : i)),
                        };
                      }
                      // Add new
                      return { ...cat, items: [...cat.items, item] };
                    })
                  );
                  setEditingItem(null);
                }}
                onCancel={() => setEditingItem(null)}
              />
            </div>
            </div>
          )}
        </div>
      )}
      </div>
    </section>
  );
}
