import { FoodItem } from '../../types';

// Vietnamese food database with calorie information
export const VIETNAMESE_FOODS: FoodItem[] = [
  // Món phở & bún
  { name: 'pho', nameVi: 'Phở bò', calories: 450, protein: 25, carbs: 55, fat: 12, servingSize: 500, servingUnit: 'tô' },
  { name: 'pho_ga', nameVi: 'Phở gà', calories: 380, protein: 22, carbs: 50, fat: 8, servingSize: 500, servingUnit: 'tô' },
  { name: 'bun_bo_hue', nameVi: 'Bún bò Huế', calories: 520, protein: 28, carbs: 52, fat: 18, servingSize: 550, servingUnit: 'tô' },
  { name: 'bun_cha', nameVi: 'Bún chả', calories: 550, protein: 30, carbs: 48, fat: 22, servingSize: 450, servingUnit: 'suất' },
  { name: 'bun_rieu', nameVi: 'Bún riêu', calories: 420, protein: 20, carbs: 50, fat: 14, servingSize: 500, servingUnit: 'tô' },
  { name: 'bun_thit_nuong', nameVi: 'Bún thịt nướng', calories: 480, protein: 26, carbs: 52, fat: 16, servingSize: 400, servingUnit: 'tô' },
  
  // Cơm
  { name: 'com_tam', nameVi: 'Cơm tấm sườn', calories: 650, protein: 32, carbs: 70, fat: 25, servingSize: 400, servingUnit: 'đĩa' },
  { name: 'com_rang', nameVi: 'Cơm rang', calories: 420, protein: 12, carbs: 60, fat: 15, servingSize: 300, servingUnit: 'đĩa' },
  { name: 'com_ga', nameVi: 'Cơm gà', calories: 550, protein: 28, carbs: 65, fat: 18, servingSize: 350, servingUnit: 'đĩa' },
  { name: 'com_suon', nameVi: 'Cơm sườn', calories: 620, protein: 30, carbs: 68, fat: 22, servingSize: 380, servingUnit: 'đĩa' },
  { name: 'rice', nameVi: 'Cơm trắng', calories: 200, protein: 4, carbs: 45, fat: 0.5, servingSize: 150, servingUnit: 'chén' },
  
  // Bánh mì & bánh
  { name: 'banh_mi', nameVi: 'Bánh mì thịt', calories: 380, protein: 18, carbs: 42, fat: 15, servingSize: 200, servingUnit: 'ổ' },
  { name: 'banh_mi_trung', nameVi: 'Bánh mì trứng', calories: 350, protein: 14, carbs: 40, fat: 14, servingSize: 180, servingUnit: 'ổ' },
  { name: 'banh_cuon', nameVi: 'Bánh cuốn', calories: 280, protein: 12, carbs: 35, fat: 10, servingSize: 250, servingUnit: 'đĩa' },
  { name: 'banh_xeo', nameVi: 'Bánh xèo', calories: 450, protein: 15, carbs: 40, fat: 25, servingSize: 200, servingUnit: 'cái' },
  
  // Mì & hủ tiếu
  { name: 'mi_quang', nameVi: 'Mì Quảng', calories: 480, protein: 24, carbs: 55, fat: 16, servingSize: 450, servingUnit: 'tô' },
  { name: 'hu_tieu', nameVi: 'Hủ tiếu', calories: 400, protein: 22, carbs: 48, fat: 12, servingSize: 450, servingUnit: 'tô' },
  { name: 'mi_xao', nameVi: 'Mì xào', calories: 520, protein: 18, carbs: 58, fat: 22, servingSize: 350, servingUnit: 'đĩa' },
  
  // Gỏi cuốn & nem
  { name: 'goi_cuon', nameVi: 'Gỏi cuốn', calories: 120, protein: 8, carbs: 18, fat: 2, servingSize: 100, servingUnit: '2 cuốn' },
  { name: 'nem_ran', nameVi: 'Nem rán', calories: 280, protein: 10, carbs: 22, fat: 18, servingSize: 120, servingUnit: '4 cái' },
  
  // Đồ uống
  { name: 'ca_phe_sua', nameVi: 'Cà phê sữa đá', calories: 150, protein: 2, carbs: 28, fat: 4, servingSize: 250, servingUnit: 'ly' },
  { name: 'tra_da', nameVi: 'Trà đá', calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: 300, servingUnit: 'ly' },
  { name: 'tra_sua', nameVi: 'Trà sữa trân châu', calories: 350, protein: 3, carbs: 65, fat: 8, servingSize: 500, servingUnit: 'ly' },
  { name: 'nuoc_mia', nameVi: 'Nước mía', calories: 180, protein: 0, carbs: 45, fat: 0, servingSize: 400, servingUnit: 'ly' },
  { name: 'sinh_to', nameVi: 'Sinh tố', calories: 200, protein: 4, carbs: 40, fat: 3, servingSize: 350, servingUnit: 'ly' },
  
  // Đồ ăn vặt
  { name: 'xoi', nameVi: 'Xôi', calories: 350, protein: 8, carbs: 55, fat: 10, servingSize: 200, servingUnit: 'gói' },
  { name: 'banh_trang_nuong', nameVi: 'Bánh tráng nướng', calories: 280, protein: 6, carbs: 35, fat: 12, servingSize: 150, servingUnit: 'cái' },
  
  // Thịt & hải sản
  { name: 'thit_kho', nameVi: 'Thịt kho', calories: 320, protein: 25, carbs: 8, fat: 22, servingSize: 150, servingUnit: 'phần' },
  { name: 'ca_kho', nameVi: 'Cá kho', calories: 280, protein: 30, carbs: 6, fat: 14, servingSize: 150, servingUnit: 'phần' },
  { name: 'tom_rang', nameVi: 'Tôm rang', calories: 180, protein: 25, carbs: 5, fat: 6, servingSize: 120, servingUnit: 'đĩa' },
  { name: 'ga_nuong', nameVi: 'Gà nướng', calories: 280, protein: 35, carbs: 2, fat: 14, servingSize: 180, servingUnit: 'phần' },
  
  // Rau & canh
  { name: 'canh_chua', nameVi: 'Canh chua', calories: 120, protein: 8, carbs: 12, fat: 4, servingSize: 300, servingUnit: 'tô' },
  { name: 'rau_xao', nameVi: 'Rau xào', calories: 80, protein: 3, carbs: 8, fat: 5, servingSize: 150, servingUnit: 'đĩa' },
  { name: 'salad', nameVi: 'Salad', calories: 100, protein: 2, carbs: 10, fat: 6, servingSize: 150, servingUnit: 'đĩa' },
  
  // International foods
  { name: 'pizza', nameVi: 'Pizza', calories: 270, protein: 12, carbs: 30, fat: 12, servingSize: 100, servingUnit: 'miếng' },
  { name: 'burger', nameVi: 'Hamburger', calories: 550, protein: 25, carbs: 40, fat: 30, servingSize: 200, servingUnit: 'cái' },
  { name: 'fried_chicken', nameVi: 'Gà rán', calories: 320, protein: 22, carbs: 12, fat: 22, servingSize: 150, servingUnit: '2 miếng' },
  { name: 'sushi', nameVi: 'Sushi', calories: 200, protein: 8, carbs: 35, fat: 3, servingSize: 150, servingUnit: '6 miếng' },
  { name: 'ramen', nameVi: 'Mì ramen', calories: 480, protein: 20, carbs: 55, fat: 18, servingSize: 500, servingUnit: 'tô' },
  
  // Trái cây
  { name: 'banana', nameVi: 'Chuối', calories: 90, protein: 1, carbs: 23, fat: 0.3, servingSize: 100, servingUnit: 'trái' },
  { name: 'apple', nameVi: 'Táo', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, servingSize: 100, servingUnit: 'trái' },
  { name: 'orange', nameVi: 'Cam', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, servingSize: 100, servingUnit: 'trái' },
  { name: 'mango', nameVi: 'Xoài', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, servingSize: 100, servingUnit: 'trái' },
  { name: 'watermelon', nameVi: 'Dưa hấu', calories: 30, protein: 0.6, carbs: 8, fat: 0.2, servingSize: 100, servingUnit: 'miếng' },
];

// Search food by name (Vietnamese or English)
export function searchFood(query: string): FoodItem[] {
  const lowerQuery = query.toLowerCase();
  return VIETNAMESE_FOODS.filter(food => 
    food.name.toLowerCase().includes(lowerQuery) ||
    food.nameVi?.toLowerCase().includes(lowerQuery)
  );
}

// Get food by exact name
export function getFoodByName(name: string): FoodItem | undefined {
  return VIETNAMESE_FOODS.find(food => 
    food.name.toLowerCase() === name.toLowerCase()
  );
}

// Food categories for UI
export const FOOD_CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🍽️' },
  { id: 'pho', name: 'Phở & Bún', icon: '🍜' },
  { id: 'rice', name: 'Cơm', icon: '🍚' },
  { id: 'banh', name: 'Bánh', icon: '🥖' },
  { id: 'drink', name: 'Đồ uống', icon: '🧋' },
  { id: 'meat', name: 'Thịt & Cá', icon: '🍖' },
  { id: 'fruit', name: 'Trái cây', icon: '🍎' },
];
