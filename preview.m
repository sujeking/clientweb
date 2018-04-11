//
//  PEComPlanDetailVC.m
//  ChronicDiseaseManager
//
//  Created by CDCT on 2017/11/20.
//  Copyright © 2017年 cdct. All rights reserved.
//

#import "EEComPlanDetailVC.h"
#import "PEComPlanDetailCell.h"

#import "PETipCircleCell.h"
#import "PEPlanDetailContentCell.h"
#import "PEPlanDetailTitleCell.h"

#import "PEBottomItemsView.h"
#import "EESchemePlanModel.h"
#import "EESchemeModel.h"


@interface EEComPlanDetailVC () <PEBottomItemsViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (nonatomic, strong) PEBottomItemsView *itemsView;
@property (nonatomic, strong) UIButton *menuBtn;
@property (nonatomic, copy) NSArray *dataSource;
@property (nonatomic, strong) EESchemeModel *schemeModel;

@property (assign, nonatomic) NSInteger indexDay;

@property (nonatomic, strong) NSMutableArray *menuItems;


@end

@implementation EEComPlanDetailVC

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setupUI];
    if (self.isLocal) {
        self.indexDay = 1;
        [self fetchDataFromLocal];
    } else {
        [self fetchDataFromServer];
    }
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    self.itemsView.isShow = YES;
    [self.itemsView showOrHidden];
}

- (void)setupUI {
    self.navigationItem.title = @"方案详情";
    [self.tableView registerNib:[UINib nibWithNibName:@"PEPlanDetailTitleCell" bundle:nil]
         forCellReuseIdentifier:@"PEPlanDetailTitleCell"];
    [self.tableView registerNib:[UINib nibWithNibName:@"PETipCircleCell" bundle:nil]
         forCellReuseIdentifier:@"PETipCircleCell"];
    [self.tableView registerNib:[UINib nibWithNibName:@"PEPlanDetailContentCell" bundle:nil]
         forCellReuseIdentifier:@"PEPlanDetailContentCell"];
    self.tableView.backgroundColor = CDCT_VIEW_BG_COLOR;
    [self.tableView setTableFooterView:[UIView new]];
    self.tableView.estimatedRowHeight = 100.0f;
    self.tableView.rowHeight = UITableViewAutomaticDimension;
    UIView *footView = [UIView new];
    footView.frame = (CGRect){0,0,0,30};
    self.tableView.tableFooterView = footView;
    
    [self.view addSubview:self.menuBtn];
    self.menuBtn.center = CGPointMake(self.menuBtn.center.x, CGRectGetMaxY(self.view.frame) - 150);
}

- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView {
    return self.dataSource.count + 1;
}

- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section {
    if (section == 0) {
        return 1;
    }
    return 2;
}

- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = indexPath.section;
    NSInteger row = indexPath.row;
    
    if (section == 0) {
        PEPlanDetailTitleCell *cell = [tableView dequeueReusableCellWithIdentifier:@"PEPlanDetailTitleCell"
                                                                      forIndexPath:indexPath];
        
        NSString *mainTitle = self.schemeModel.CJKFABT;
        NSDictionary *dict = self.menuItems[self.indexDay - 1];
        NSString *title = [NSString stringWithFormat:@"%@ (第%@天)",mainTitle,[dict valueForKey:@"day"]];
        cell.titleStr = title;
        return cell;
    }
    
    EESchemePlanModel *item = self.dataSource[section - 1];
    if (row == 0) {

        PETipCircleCell *cell = [tableView dequeueReusableCellWithIdentifier:@"PETipCircleCell"
                                                                forIndexPath:indexPath];
        cell.titleStr = item.CJHBT;
        cell.isBegin = NO;
        cell.isEnd = NO;
        
        if (section == 1) {
            cell.isBegin = YES;
        }
        
        if (section == self.dataSource.count) {
            cell.isEnd = YES;
        }
        return cell;
    } else {
        PEPlanDetailContentCell *cell = [tableView dequeueReusableCellWithIdentifier:@"PEPlanDetailContentCell"
                                                                        forIndexPath:indexPath];
        cell.contentStr = item.CJHNR;
        cell.imgURIS = item.CJKJHDT;
        if (section == self.dataSource.count) {
            cell.isLast = YES;
        } else {
            cell.isLast = NO;
        }
        return cell;
    }
    return nil;
}

- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath {
    NSInteger section = indexPath.section;
    NSInteger row = indexPath.row;
    if (section == 0) {
        return 60.0f;
    }
    if (row == 0) {
        return 45.0f;
    } else {
        return UITableViewAutomaticDimension;
    }
    return 0.001f;
}

- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section {
    if (section == 0) {
        return 15.0f;
    }
    return 0.01f;
}

- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section {
    return 0.01;
}

- (UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section {
    UIView *v = [UIView new];
    v.backgroundColor = [UIColor whiteColor];
    return v;
}

- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section {
    UIView *v = [UIView new];
    if (section == 0) {
        v.backgroundColor = CDCT_VIEW_BG_COLOR;
    } else {
        v.backgroundColor = [UIColor whiteColor];
    }
    return v;
}

- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath {
}

- (void)fetchDataFromLocal {
    if (self.schemeModel == nil) {
        NSDictionary *schemeDict = [self.dbmanager queyOneDataWithTName:NSStringFromClass([EESchemeModel class])];
        self.schemeModel = [EESchemeModel mj_objectWithKeyValues:schemeDict];
        NSString *dayStr = self.schemeModel.CJKFAZQ;
        
        self.menuItems = [NSMutableArray new];
        NSMutableArray *tempArr = [NSMutableArray new];
        for(NSInteger i = 1; i <= dayStr.intValue; i++) {
            [tempArr addObject:@(i)];
        }
        NSArray *chineseNums = [EEBaseViewModel coverNum2Chinese:tempArr];
        for (NSString *number in chineseNums) {
            NSDictionary *dict = @{@"day":number,@"status":@(2)};
            [self.menuItems addObject:dict];
        }
    }
    
    NSString *day = @(self.indexDay).stringValue;
    NSString *sql = [NSString stringWithFormat:@"SELECT * FROM %@ WHERE CJHWCCS GLOB '%@,*' OR CJHWCCS GLOB '*,%@,*' OR CJHWCCS GLOB '*,%@' OR CJHWCCS GLOB '%@'",NSStringFromClass([EESchemePlanModel class]),day,day,day,day];
    NSArray *dicts = [self.dbmanager customQuryDataWithSql:sql];
    self.dataSource = [EESchemePlanModel mj_objectArrayWithKeyValuesArray:dicts];
    [self.tableView reloadData];
}

- (void)fetchDataFromServer {
    
}

// MARK: - PEBottomItemsViewDelegate

- (void)selectedItemsViewWithIndex:(NSInteger)index {
    if (self.isLocal) {
        self.indexDay = index;
        [self fetchDataFromLocal];
    } else {
        [self fetchDataFromServer];
    }
    self.itemsView.currentIndex = index;
    [self.itemsView showOrHidden];
}

// MARK: - Action
- (void)menuBtnClickAction {
    if(self.itemsView == nil) {
        self.itemsView = [[PEBottomItemsView alloc]
                          initWithItems:self.menuItems];
        self.itemsView.delegate = self;
        self.itemsView.currentIndex = self.indexDay;
    }
    [self.itemsView showOrHidden];
}

// MARK: - GET
- (UIButton *)menuBtn {
    if (_menuBtn == nil) {
        _menuBtn = [UIButton buttonWithType:UIButtonTypeCustom];
        _menuBtn.frame = CGRectMake(20, 0, 45, 45);
        [_menuBtn setImage:[UIImage imageNamed:@"ic_base_plandetail_menu"] forState:UIControlStateNormal];
        [_menuBtn addTarget:self action:@selector(menuBtnClickAction)
           forControlEvents:UIControlEventTouchUpInside];
    }
    return _menuBtn;
}

@end
