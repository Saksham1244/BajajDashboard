USE [master]
GO
/****** Object:  Database [PPMS_BajajPant]    Script Date: 8/10/2026 1:55:25 PM ******/
CREATE DATABASE [PPMS_BajajPant]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'PPMS_BajajPant', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER01\MSSQL\DATA\PPMS_BajajPant.mdf' , SIZE = 73728KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'PPMS_BajajPant_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL17.MSSQLSERVER01\MSSQL\DATA\PPMS_BajajPant_log.ldf' , SIZE = 139264KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [PPMS_BajajPant] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [PPMS_BajajPant].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [PPMS_BajajPant] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ARITHABORT OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [PPMS_BajajPant] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [PPMS_BajajPant] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET  DISABLE_BROKER 
GO
ALTER DATABASE [PPMS_BajajPant] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [PPMS_BajajPant] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET RECOVERY FULL 
GO
ALTER DATABASE [PPMS_BajajPant] SET  MULTI_USER 
GO
ALTER DATABASE [PPMS_BajajPant] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [PPMS_BajajPant] SET DB_CHAINING OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [PPMS_BajajPant] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [PPMS_BajajPant] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [PPMS_BajajPant] SET OPTIMIZED_LOCKING = OFF 
GO
ALTER DATABASE [PPMS_BajajPant] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'PPMS_BajajPant', N'ON'
GO
ALTER DATABASE [PPMS_BajajPant] SET QUERY_STORE = ON
GO
ALTER DATABASE [PPMS_BajajPant] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [PPMS_BajajPant]
GO
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;
GO
USE [PPMS_BajajPant]
GO
/****** Object:  User [Tanish]    Script Date: 8/10/2026 1:55:27 PM ******/
CREATE USER [Tanish] FOR LOGIN [Tanish] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  User [genesis1]    Script Date: 8/10/2026 1:55:27 PM ******/
CREATE USER [genesis1] WITHOUT LOGIN WITH DEFAULT_SCHEMA=[dbo]
GO
ALTER ROLE [db_owner] ADD MEMBER [Tanish]
GO
ALTER ROLE [db_owner] ADD MEMBER [genesis1]
GO
/****** Object:  Table [dbo].[Config_Station]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Station](
	[StationID] [int] IDENTITY(1,1) NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[LineZoneID] [int] NULL,
	[StationName] [nvarchar](100) NULL,
	[StationDesc] [nvarchar](300) NULL,
	[StationType] [int] NULL,
	[StationSide] [nvarchar](50) NULL,
	[StageNo] [int] NULL,
	[SkillLevel] [int] NULL,
 CONSTRAINT [PK__Config_S__E0D8A6DDA0259668] PRIMARY KEY CLUSTERED 
(
	[StationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Plant]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Plant](
	[PlantID] [int] IDENTITY(1,1) NOT NULL,
	[PlantName] [nvarchar](100) NULL,
	[PlantDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_P__98FE46BCC103A73D] PRIMARY KEY CLUSTERED 
(
	[PlantID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Shop]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Shop](
	[ShopID] [int] IDENTITY(1,1) NOT NULL,
	[PlantID] [int] NULL,
	[ShopName] [nvarchar](100) NULL,
	[ShopDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_S__67C556294D22D041] PRIMARY KEY CLUSTERED 
(
	[ShopID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Line]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Line](
	[LineID] [int] IDENTITY(1,1) NOT NULL,
	[ShopID] [int] NULL,
	[LineName] [nvarchar](100) NULL,
	[LineDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_L__2EAE64C9F101BDFC] PRIMARY KEY CLUSTERED 
(
	[LineID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_SubAssemblyLine]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_SubAssemblyLine](
	[SubAsslyLineID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[SubAsslyLineName] [nvarchar](100) NULL,
	[SubAsslyLineDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_S__4EE2C37E32D71EA2] PRIMARY KEY CLUSTERED 
(
	[SubAsslyLineID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Zone]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Zone](
	[LineZoneID] [int] IDENTITY(1,1) NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[LineZoneName] [nvarchar](100) NULL,
	[LineZoneDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_Z__6016679514827AC0] PRIMARY KEY CLUSTERED 
(
	[LineZoneID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[V_Config_PlantModelling]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[V_Config_PlantModelling]
AS
SELECT dbo.Config_Plant.PlantID, dbo.Config_Plant.PlantName, dbo.Config_Shop.ShopID, dbo.Config_Shop.ShopName, dbo.Config_Line.LineID, dbo.Config_Line.LineName, dbo.Config_SubAssemblyLine.SubAsslyLineID, dbo.Config_SubAssemblyLine.SubAsslyLineName, 
             dbo.Config_Zone.LineZoneID, dbo.Config_Zone.LineZoneName, dbo.Config_Station.StationID, dbo.Config_Station.StationName
FROM   dbo.Config_Plant INNER JOIN
             dbo.Config_Shop ON dbo.Config_Plant.PlantID = dbo.Config_Shop.PlantID INNER JOIN
             dbo.Config_Line ON dbo.Config_Shop.ShopID = dbo.Config_Line.ShopID INNER JOIN
             dbo.Config_SubAssemblyLine ON dbo.Config_Line.LineID = dbo.Config_SubAssemblyLine.LineID INNER JOIN
             dbo.Config_Zone ON dbo.Config_SubAssemblyLine.SubAsslyLineID = dbo.Config_Zone.SubAsslyLineID INNER JOIN
             dbo.Config_Station ON dbo.Config_Zone.LineZoneID = dbo.Config_Station.LineZoneID
GO
/****** Object:  Table [dbo].[Config_Equipment_Type]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Equipment_Type](
	[EquipmentTypeID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentTypeName] [nvarchar](100) NULL,
	[EquipmentTypeDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_E__92615555A4C1D1C6] PRIMARY KEY CLUSTERED 
(
	[EquipmentTypeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Equipment]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Equipment](
	[EquipmentID] [int] IDENTITY(1,1) NOT NULL,
	[StationID] [int] NULL,
	[EquipmentName] [nvarchar](100) NULL,
	[EquipmentDesc] [nvarchar](300) NULL,
	[EquipmentTypeID] [int] NULL,
 CONSTRAINT [PK__Config_E__9860D1B75733C284] PRIMARY KEY CLUSTERED 
(
	[EquipmentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[V_Config_Equipment_PlantModelling]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[V_Config_Equipment_PlantModelling]
AS
SELECT dbo.Config_Equipment.EquipmentID, dbo.Config_Equipment.EquipmentName, dbo.Config_Equipment.EquipmentDesc, dbo.Config_Equipment.EquipmentTypeID, dbo.Config_Equipment_Type.EquipmentTypeDesc, dbo.Config_Equipment.StationID, 
             dbo.V_Config_PlantModelling.StationName, dbo.V_Config_PlantModelling.LineZoneID, dbo.V_Config_PlantModelling.LineZoneName, dbo.V_Config_PlantModelling.SubAsslyLineID, dbo.V_Config_PlantModelling.SubAsslyLineName, dbo.V_Config_PlantModelling.LineID, 
             dbo.V_Config_PlantModelling.LineName, dbo.V_Config_PlantModelling.ShopID, dbo.V_Config_PlantModelling.ShopName, dbo.V_Config_PlantModelling.PlantID, dbo.V_Config_PlantModelling.PlantName
FROM   dbo.Config_Equipment INNER JOIN
             dbo.Config_Equipment_Type ON dbo.Config_Equipment.EquipmentTypeID = dbo.Config_Equipment_Type.EquipmentTypeID INNER JOIN
             dbo.V_Config_PlantModelling ON dbo.Config_Equipment.StationID = dbo.V_Config_PlantModelling.StationID
GO
/****** Object:  Table [dbo].[Config_Model]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Model](
	[ModelID] [int] IDENTITY(1,1) NOT NULL,
	[ModelFamilyID] [int] NULL,
	[ModelName] [nvarchar](100) NULL,
	[ModelDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_M__E8D7A1CCFD561BA3] PRIMARY KEY CLUSTERED 
(
	[ModelID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_SKU]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_SKU](
	[SKUID] [int] IDENTITY(1,1) NOT NULL,
	[ModelID] [int] NULL,
	[SKUName] [nvarchar](100) NULL,
	[SKUDesc] [nvarchar](300) NULL,
	[SKUType] [int] NULL,
 CONSTRAINT [PK__Config_S__9AEA1BAC4044C367] PRIMARY KEY CLUSTERED 
(
	[SKUID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_ModelFamily]    Script Date: 8/10/2026 1:55:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_ModelFamily](
	[ModelFamilyID] [int] IDENTITY(1,1) NOT NULL,
	[ModelFamilyName] [nvarchar](100) NULL,
	[ModelFamilyDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_M__4D92AAF11FC38C7F] PRIMARY KEY CLUSTERED 
(
	[ModelFamilyID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[V_Config_MF_M_SKU]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE   VIEW [dbo].[V_Config_MF_M_SKU]
AS
SELECT dbo.Config_ModelFamily.ModelFamilyID, dbo.Config_ModelFamily.ModelFamilyName, dbo.Config_Model.ModelID, dbo.Config_Model.ModelName, dbo.Config_SKU.SKUID, dbo.Config_SKU.SKUName
FROM   dbo.Config_ModelFamily INNER JOIN
             dbo.Config_Model ON dbo.Config_ModelFamily.ModelFamilyID = dbo.Config_Model.ModelFamilyID INNER JOIN
             dbo.Config_SKU ON dbo.Config_Model.ModelID = dbo.Config_SKU.ModelID
GO
/****** Object:  Table [dbo].[ApplicationSetting]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ApplicationSetting](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[TimeStamp] [datetime] NULL,
	[LineID] [int] NULL,
	[ParameterID] [int] NULL,
	[ParameterName] [nvarchar](100) NULL,
	[ParameterValue] [nvarchar](50) NULL,
 CONSTRAINT [PK__Prod_Shi__C5B19602A084A017] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[BarcodeReprintLog]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[BarcodeReprintLog](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[UserID] [nvarchar](50) NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
	[Remark] [nvarchar](max) NULL,
 CONSTRAINT [PK_BarcodeReprintLog] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Activity]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Activity](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ModelID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[EquipmentID] [int] NOT NULL,
	[StageNo] [int] NOT NULL,
	[ActivityDesc] [nvarchar](300) NOT NULL,
	[ActivityEnable] [int] NOT NULL,
	[ActivityType] [int] NOT NULL,
	[Count] [int] NOT NULL,
	[SequenceNo] [int] NOT NULL,
	[ActivityDuration] [int] NOT NULL,
	[Ref01] [int] NULL,
	[Ref02] [int] NULL,
	[Ref03] [decimal](5, 2) NULL,
	[Ref04] [decimal](5, 2) NULL,
	[Ref05] [nvarchar](100) NULL,
	[Ref06] [nvarchar](100) NULL,
	[ModelFamilyID] [int] NULL,
 CONSTRAINT [PK__Config_A__C5B19602B9D6D1D2] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Activity_SOP_Mapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Activity_SOP_Mapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[StationID] [int] NULL,
	[ActivityID] [int] NULL,
	[SOPID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[SequenceNo] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Alarm]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Alarm](
	[AlarmID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentID] [int] NOT NULL,
	[DepartmentID] [int] NULL,
	[AlarmMessage] [nvarchar](max) NULL,
	[AlarmDesc] [nvarchar](300) NULL,
	[AlarmType] [int] NOT NULL,
	[Priority] [int] NOT NULL,
 CONSTRAINT [PK__Config_A__43E5EB1587868D7C] PRIMARY KEY CLUSTERED 
(
	[AlarmID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_AuditDocumentMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_AuditDocumentMapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditGroup] [nvarchar](20) NULL,
	[DocumentNo] [int] NULL,
	[ModelFamily] [int] NULL,
	[Model] [int] NULL,
	[SKU] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[AuditListID] [int] NULL,
	[AuditListScreen] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_AuditList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_AuditList](
	[AuditListID] [int] IDENTITY(1,1) NOT NULL,
	[DocumentID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[AuditListName] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK__Config_A__357B5C7FD254AFA7] PRIMARY KEY CLUSTERED 
(
	[AuditListID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_AuditPointLinking]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_AuditPointLinking](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[DocumentID] [int] NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[Revision] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[EnginePartID] [nvarchar](10) NOT NULL,
	[ActivityID] [int] NULL,
	[ParameterID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_AuditSchedule]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_AuditSchedule](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NOT NULL,
	[DocumentID] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[StartDateTime] [datetime] NULL,
	[NextDueDate] [datetime] NULL,
	[FrequencyType] [int] NOT NULL,
	[FrequencyValue] [int] NOT NULL,
	[Notification] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK_Config_AuditSchedule] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_BOM]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_BOM](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[PartDesc] [nvarchar](300) NOT NULL,
	[PartLevel] [int] NULL,
	[PartQuantity] [int] NULL,
	[ParentID] [nvarchar](20) NULL,
	[AlternatePartFlag] [int] NULL,
	[StationID] [int] NULL,
	[PreferredPartID] [nvarchar](20) NULL,
	[MaterialMoveType] [int] NULL,
 CONSTRAINT [PK_Config_Bom_UID] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Department]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Department](
	[DepartmentID] [int] IDENTITY(1,1) NOT NULL,
	[DepartmentName] [nvarchar](100) NULL,
	[DepartmentDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_D__B2079BCDFF46CFF2] PRIMARY KEY CLUSTERED 
(
	[DepartmentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_DropDown]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_DropDown](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[TableName] [nvarchar](100) NOT NULL,
	[FieldName] [nvarchar](100) NOT NULL,
	[FieldValue] [int] NOT NULL,
	[FieldDesc] [nvarchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Config_DropDown] UNIQUE NONCLUSTERED 
(
	[TableName] ASC,
	[FieldName] ASC,
	[FieldValue] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_EnginePart]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_EnginePart](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EnginePartID] [nvarchar](10) NOT NULL,
	[EnginePartDesc] [nvarchar](300) NOT NULL,
	[EnginePartLevel] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Config_EnginePart_EnginePartID] UNIQUE NONCLUSTERED 
(
	[EnginePartID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Equipment_Part]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Equipment_Part](
	[EquipmentPartID] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentID] [int] NULL,
	[EquipmentPartName] [nvarchar](100) NULL,
	[EquipmentPartDesc] [nvarchar](300) NOT NULL,
 CONSTRAINT [PK__Config_E__2CCF7F20D911F730] PRIMARY KEY CLUSTERED 
(
	[EquipmentPartID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_FQC_EngFiringAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_FQC_EngFiringAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_FQC_EngInbuiltAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_FQC_EngInbuiltAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_FQC_EngPerformanceAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_FQC_EngPerformanceAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[LLPowerValue] [decimal](5, 2) NULL,
	[ULPowerValue] [decimal](5, 2) NULL,
	[PowerRPM] [int] NULL,
	[LLTorqueValue] [decimal](5, 2) NULL,
	[ULTorqueValue] [decimal](5, 2) NULL,
	[TorqueRPM] [int] NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_FQC_EngStripAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_FQC_EngStripAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[TimeStamp] [datetime] NULL,
	[ScreenName] [nvarchar](100) NULL,
	[PrimaryKeyValue] [nvarchar](50) NULL,
	[FieldName] [nvarchar](100) NULL,
	[OldValue] [nvarchar](max) NULL,
	[NewValue] [nvarchar](max) NULL,
	[Status] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[UpdatedBy] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Inspection_Action]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Inspection_Action](
	[ActionID] [int] IDENTITY(1,1) NOT NULL,
	[DefectID] [int] NULL,
	[ActionDesc] [nvarchar](100) NOT NULL,
 CONSTRAINT [PK__Config_I__FFE3F4B901B9D426] PRIMARY KEY CLUSTERED 
(
	[ActionID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Inspection_Defect]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Inspection_Defect](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[DefectID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[InspectionPointID] [int] NULL,
	[DefectName] [nvarchar](100) NULL,
	[QAlertStation] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Inspection_Point]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Inspection_Point](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[InspectionPointID] [int] NULL,
	[InspectionStationID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[InspectionPointName] [nvarchar](100) NULL,
	[InspectionPointDes] [nvarchar](300) NULL,
	[InspectionPointType] [int] NULL,
	[InspectionPointAction] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Inspection_Station]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Inspection_Station](
	[InspectionStationID] [int] IDENTITY(1,1) NOT NULL,
	[StationID] [int] NULL,
	[InspectionStationName] [nvarchar](100) NULL,
	[InspectionStationDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK_Config_Inspection_Station] PRIMARY KEY CLUSTERED 
(
	[InspectionStationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_ManagerAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_ManagerAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[Category] [nvarchar](100) NULL,
	[Type] [nvarchar](50) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Config_I__C5B196027AD55B2E] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_PartPressAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_PartPressAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Config_I__C5B196022392B25A] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_PYMachineAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_PYMachineAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[ActivityID] [int] NOT NULL,
	[AuditListID] [int] NOT NULL,
	[DefectPossibility] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Config_I__C5B1960264AEB0B3] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_PYOnlineAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_PYOnlineAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[ActivityID] [int] NOT NULL,
	[AuditListID] [int] NOT NULL,
	[Type] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Config_I__C5B196024C401A7D] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_SOPAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_SOPAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[Category] [nvarchar](100) NULL,
	[AuditProcess] [nvarchar](300) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IPQC_TorqueAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IPQC_TorqueAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[ActivityID] [int] NULL,
	[Category] [nvarchar](100) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IQC_MiliporeAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IQC_MiliporeAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[VendorID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[TargetLimit] [decimal](5, 2) NULL,
	[SpecificationLimit] [decimal](5, 2) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_IQC_VisualInspectAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_IQC_VisualInspectAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[ModelFamilyID] [int] NOT NULL,
	[ModelID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[Aspect] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_JHActivity]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_JHActivity](
	[JHActivityID] [int] IDENTITY(1,1) NOT NULL,
	[Description] [nvarchar](300) NOT NULL,
 CONSTRAINT [PK_Config_JHActivity] PRIMARY KEY CLUSTERED 
(
	[JHActivityID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_KITBOM]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_KITBOM](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[PartQuantity] [int] NOT NULL,
	[KitSlotID] [int] NOT NULL,
	[KitZoneID] [int] NOT NULL,
 CONSTRAINT [PK_Config_KITBOM] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_LineSpeedOperatorCount]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_LineSpeedOperatorCount](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[LineSpeed] [int] NULL,
	[OperatorCount] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_LineSpeedOperatorMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_LineSpeedOperatorMapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[LineSpeed] [int] NULL,
	[SubAsslyLineID] [int] NULL,
	[Operator] [int] NULL,
	[Station1] [int] NULL,
	[Station2] [int] NULL,
	[Station3] [int] NULL,
	[Station4] [int] NULL,
	[Station5] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_LossCategory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_LossCategory](
	[LossID] [int] IDENTITY(1,1) NOT NULL,
	[LossName] [nvarchar](100) NULL,
	[LossDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_L__7025E39414020226] PRIMARY KEY CLUSTERED 
(
	[LossID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_MaterialLocationMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_MaterialLocationMapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[LocationID] [int] NOT NULL,
	[Capacity] [int] NOT NULL,
	[StorageType] [int] NOT NULL,
	[PackStdQty] [int] NOT NULL,
	[MinLineStock] [int] NOT NULL,
	[MaxLineStock] [int] NOT NULL,
	[MinTotalStock] [int] NOT NULL,
	[MaxTotalStock] [int] NOT NULL,
 CONSTRAINT [PK_Config_MaterialLocationMapping] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_MobileTerminal]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_MobileTerminal](
	[DeviceID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[StaticIP] [nvarchar](50) NULL,
	[DeviceDesc] [nvarchar](300) NULL,
	[DeviceStatus] [int] NULL,
	[DeviceType] [int] NULL,
 CONSTRAINT [PK_Config_MobileTerminal] PRIMARY KEY CLUSTERED 
(
	[DeviceID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_MonthCode]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_MonthCode](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[MonthValue] [int] NOT NULL,
	[MonthCode] [varchar](5) NOT NULL,
 CONSTRAINT [PK_Config_MonthCode] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_OperatorSkillMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_OperatorSkillMapping](
	[UID] [bigint] IDENTITY(1,1) NOT NULL,
	[UserID] [nvarchar](50) NULL,
	[SkillID] [int] NULL,
	[SkillLevelID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Parameter]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Parameter](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[ParameterID] [int] NOT NULL,
	[ParameterName] [nvarchar](100) NOT NULL,
	[SKUID] [int] NOT NULL,
	[ParameterType] [nvarchar](100) NOT NULL,
	[ParameterSpecification] [decimal](5, 2) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_PartVariant]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_PartVariant](
	[PartID] [nvarchar](20) NOT NULL,
	[EnginePartID] [int] NULL,
	[PartName] [nvarchar](100) NULL,
	[PartDesc] [nvarchar](300) NOT NULL,
	[PartTracking] [int] NULL,
	[PartInspection] [int] NULL,
	[PartInspectionType] [int] NULL,
	[PartInspectionFreq] [int] NULL,
	[PartSamplingLevel] [int] NULL,
	[PartAddInspFreq] [int] NULL,
	[PartStockAuditFreq] [int] NULL,
 CONSTRAINT [PK_Config_Part] PRIMARY KEY CLUSTERED 
(
	[PartID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_PMCheckList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_PMCheckList](
	[CheckListId] [int] IDENTITY(1,1) NOT NULL,
	[EquipmentId] [int] NULL,
	[CheckListName] [nvarchar](100) NULL,
	[CheckListDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK_Config_PMCheckList] PRIMARY KEY CLUSTERED 
(
	[CheckListId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_PMCheckPoints]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_PMCheckPoints](
	[CheckPointId] [int] IDENTITY(1,1) NOT NULL,
	[CheckListId] [int] NULL,
	[CheckPointName] [nvarchar](100) NULL,
	[PlannedDuration] [int] NULL,
	[Observation] [nvarchar](max) NULL,
	[Standards] [nvarchar](50) NULL,
	[Frequency] [int] NULL,
 CONSTRAINT [PK_Config_PMCheckPoints] PRIMARY KEY CLUSTERED 
(
	[CheckPointId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_PMSchedule]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_PMSchedule](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineId] [int] NULL,
	[CheckListId] [int] NULL,
	[StartDate] [date] NULL,
	[StartCount] [int] NULL,
	[FrequencyType] [int] NULL,
	[FrequencyValue] [int] NULL,
	[Alert] [int] NULL,
	[EstimatedDuration] [int] NULL,
 CONSTRAINT [PK_Config_PMSchedule] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_QADocumentList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_QADocumentList](
	[DocumentID] [int] IDENTITY(1,1) NOT NULL,
	[DocumentNo] [int] NULL,
	[DocumentName] [nvarchar](100) NULL,
	[Group] [nvarchar](100) NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[DocumentID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Role]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Role](
	[RoleID] [int] IDENTITY(1,1) NOT NULL,
	[RoleName] [nvarchar](100) NULL,
	[RoleDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK__Config_R__8AFACE3A5CC2B285] PRIMARY KEY CLUSTERED 
(
	[RoleID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Shift]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Shift](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SessionID] [int] NULL,
	[SessionDesc] [nvarchar](300) NULL,
	[Shift] [nvarchar](10) NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Skill]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Skill](
	[SkillID] [int] IDENTITY(1,1) NOT NULL,
	[SkillName] [nvarchar](100) NULL,
	[SkillDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK_Config_Skill] PRIMARY KEY CLUSTERED 
(
	[SkillID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_SkillLevel]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_SkillLevel](
	[SkillLevelID] [int] IDENTITY(1,1) NOT NULL,
	[SkillLevelName] [nvarchar](100) NULL,
	[SkillLevelDesc] [nvarchar](300) NULL,
 CONSTRAINT [PK_Config_SkillLevel] PRIMARY KEY CLUSTERED 
(
	[SkillLevelID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_SOPPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_SOPPoint](
	[SOPID] [int] IDENTITY(1,1) NOT NULL,
	[SOPPoint] [nvarchar](max) NULL,
	[SOPLabel] [int] NULL,
	[SOPType] [int] NOT NULL,
 CONSTRAINT [PK__Config_S__B68C74B463E8A8C7] PRIMARY KEY CLUSTERED 
(
	[SOPID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Station_JHActivity_Mapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Station_JHActivity_Mapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[JHActivityID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[SequenceNo] [int] NOT NULL,
 CONSTRAINT [PK_Config_Station_JHActivity_Mapping] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StationClusterDisplayMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StationClusterDisplayMapping](
	[ClusterDisplayID] [int] IDENTITY(1,1) NOT NULL,
	[ClusterDisplayScreenName] [nvarchar](50) NOT NULL,
	[IPAddress] [nvarchar](20) NOT NULL,
	[Position1] [int] NULL,
	[Position2] [int] NULL,
	[Position3] [int] NULL,
	[Position4] [int] NULL,
 CONSTRAINT [PK_Config_StationClusterDisplayMapping] PRIMARY KEY CLUSTERED 
(
	[ClusterDisplayID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StationSkillMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StationSkillMapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[SkillID] [int] NULL,
	[SkillLevelID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StorageArea]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StorageArea](
	[AreaID] [int] IDENTITY(1,1) NOT NULL,
	[AreaName] [nvarchar](100) NULL,
	[Type] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[AreaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StorageLocation]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StorageLocation](
	[LocationID] [int] IDENTITY(1,1) NOT NULL,
	[RackID] [int] NULL,
	[Row] [int] NULL,
	[Column] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[LocationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StorageRack]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StorageRack](
	[RackID] [int] IDENTITY(1,1) NOT NULL,
	[RackName] [nvarchar](100) NULL,
	[StorageZoneID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[RackID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_StorageZone]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_StorageZone](
	[StorageZoneID] [int] IDENTITY(1,1) NOT NULL,
	[StorageZoneName] [nvarchar](100) NULL,
	[AreaID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[StorageZoneID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_SubLossCategory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_SubLossCategory](
	[SubLossID] [int] IDENTITY(1,1) NOT NULL,
	[SubLossName] [nvarchar](100) NULL,
	[SubLossDesc] [nvarchar](300) NULL,
	[LossID] [int] NULL,
 CONSTRAINT [PK__Config_S__E5F1A7BF17E40F06] PRIMARY KEY CLUSTERED 
(
	[SubLossID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_User]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_User](
	[UserID] [nvarchar](50) NOT NULL,
	[DepartmentID] [int] NOT NULL,
	[DepartmentRoleID] [int] NOT NULL,
	[UserName] [nvarchar](100) NOT NULL,
	[EmailID] [nvarchar](50) NULL,
	[MobileNo] [numeric](10, 0) NULL,
	[Password] [nvarchar](50) NOT NULL,
	[AadharNo] [nvarchar](12) NULL,
PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor](
	[VendorID] [int] IDENTITY(1,1) NOT NULL,
	[VendorName] [nvarchar](100) NOT NULL,
	[VendorCode] [int] NULL,
	[VendorDesc] [nvarchar](300) NULL,
	[VendorType] [int] NOT NULL,
	[VendorStatus] [int] NULL,
 CONSTRAINT [PK__Config_V__FC8618D3DF70A012] PRIMARY KEY CLUSTERED 
(
	[VendorID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_ChecklistMetaData]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_ChecklistMetaData](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[MetaDataName] [nvarchar](100) NULL,
	[MetaDataValue] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_InspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_InspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Specification] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_IPOAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_IPOAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[Operation] [nvarchar](100) NULL,
	[Step] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Specification] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_Part_Mapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_Part_Mapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[VendorID] [int] NOT NULL,
	[Priority] [int] NULL,
	[Status] [int] NULL,
	[PartLevel] [int] NOT NULL,
 CONSTRAINT [PK__Config_V__C5B19602DDB07911] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_PartInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_PartInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Specification] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_ProcessInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_ProcessInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[StageNo] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Specification] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_Vendor_SampleInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_Vendor_SampleInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointId] [int] NOT NULL,
	[AuditPointName] [nvarchar](100) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[Specification] [nvarchar](100) NULL,
	[CheckingMethod] [nvarchar](100) NULL,
	[Status] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Config_YearCode]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Config_YearCode](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[YearValue] [int] NOT NULL,
	[YearCode] [varchar](5) NOT NULL,
 CONSTRAINT [PK_Config_YearCode] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[JHActivity_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[JHActivity_Log](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[StationID] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[Status] [int] NOT NULL,
	[Remark] [nvarchar](max) NULL,
 CONSTRAINT [PK_JHActivity_Log] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Maint_ActiveAlarm]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Maint_ActiveAlarm](
	[AlarmID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[AlarmMessage] [nvarchar](50) NOT NULL,
	[AlarmType] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[AlarmID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Maint_AlarmLog]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Maint_AlarmLog](
	[UID] [bigint] IDENTITY(1,1) NOT NULL,
	[AlarmID] [int] NOT NULL,
	[AlarmVal] [int] NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Maint_BreakDown_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Maint_BreakDown_Log](
	[BreakdownID] [bigint] IDENTITY(1,1) NOT NULL,
	[StationID] [int] NOT NULL,
	[EquipmentID] [int] NOT NULL,
	[LossID] [int] NULL,
	[AlarmID] [int] NOT NULL,
	[SubLossID] [int] NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[BDStartTime] [datetime] NOT NULL,
	[BDEndTime] [datetime] NULL,
	[BDDuration]  AS (datediff(second,[BDStartTime],[BDEndTime])),
	[TotalBDTime] [int] NULL,
	[TotalBDCount] [int] NULL,
	[AssignedUserID] [nvarchar](50) NULL,
	[BDReason] [nvarchar](max) NULL,
	[BDStatus] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[BreakdownID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_BatchWiseQty]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_BatchWiseQty](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[AreaID] [int] NULL,
	[BatchID] [nvarchar](20) NULL,
	[Priority] [int] NULL,
	[Quantity] [int] NULL,
	[Consumed] [int] NULL,
	[Status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_KitbinHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_KitbinHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[KitbinID] [int] NOT NULL,
	[KITStatus] [int] NOT NULL,
	[WashingStatus] [int] NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
	[Remark] [nvarchar](max) NULL,
 CONSTRAINT [PK_Material_KitbinHistory] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_KitbinManagement]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_KitbinManagement](
	[KitbinID] [int] IDENTITY(1,1) NOT NULL,
	[KitbinGRP] [int] NOT NULL,
	[WashSch] [int] NOT NULL,
	[LastWash] [int] NOT NULL,
	[NextWash] [int] NOT NULL,
	[KITStatus] [int] NOT NULL,
	[WashingStatus] [int] NOT NULL,
 CONSTRAINT [PK_Material_KitbinManagement] PRIMARY KEY CLUSTERED 
(
	[KitbinID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Movement_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Movement_Log](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [nvarchar](20) NULL,
	[Source] [nvarchar](100) NULL,
	[Destination] [nvarchar](100) NULL,
	[Quantity] [int] NULL,
	[BatchID] [int] NULL,
	[TimeStamp] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Receiving]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Receiving](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EDINumber] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[Quantity] [int] NULL,
	[Timestamp] [datetime] NULL,
	[ValidatedQty] [int] NULL,
	[OKQty] [int] NOT NULL,
	[RejectedQty] [int] NOT NULL,
	[HoldQty] [int] NOT NULL,
	[ValidatedBy] [nvarchar](50) NULL,
	[SampleQty] [int] NULL,
	[SampleLevel] [int] NULL,
	[Status] [int] NULL,
	[BatchID] [nvarchar](20) NULL,
	[Remark] [nvarchar](max) NULL,
 CONSTRAINT [PK__Material__C5B196024E395403] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Receiving_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Receiving_Geneology](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EDINumber] [nvarchar](20) NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[Status] [int] NOT NULL,
	[LastUpdatedBy] [nvarchar](50) NULL,
	[LastUpdatedTime] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Receiving_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Receiving_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EDINumber] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[Quantity] [int] NULL,
	[Timestamp] [datetime] NULL,
	[ValidatedQty] [int] NULL,
	[OKQty] [int] NOT NULL,
	[RejectedQty] [int] NOT NULL,
	[HoldQty] [int] NOT NULL,
	[ValidatedBy] [nvarchar](50) NULL,
	[SampleQty] [int] NULL,
	[SampleLevel] [int] NULL,
	[Status] [int] NULL,
	[BatchID] [nvarchar](20) NULL,
	[Remark] [nvarchar](max) NULL,
 CONSTRAINT [PK__Material__History__C5B196024E395403] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Rejected]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Rejected](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[PartID] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[RejectionSource] [int] NULL,
	[EDINumber] [nvarchar](20) NULL,
	[AuditListID] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[BatchID] [nvarchar](20) NULL,
	[Quantity] [int] NULL,
	[Status] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Running_Plan]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Running_Plan](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PlanID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[RequiredQty] [int] NULL,
	[DeliveredQty] [int] NULL,
	[Consumed Qty] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Material_Stock]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Material_Stock](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PartID] [nvarchar](20) NULL,
	[IncomingQty] [int] NULL,
	[StoreQty] [int] NULL,
	[LineCKitRackQty] [int] NULL,
	[LineDKitRackQty] [int] NULL,
	[LineCMaterialOnKit] [int] NOT NULL,
	[LineDMaterialOnKit] [int] NOT NULL,
	[LineCQty] [int] NULL,
	[LineDQty] [int] NULL,
	[LinesideCQty] [int] NULL,
	[LinesideDQty] [int] NULL,
 CONSTRAINT [PK__Material__C5B1960235E2F0B6] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[NotificationManagement]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[NotificationManagement](
	[NotificationID] [int] IDENTITY(1,1) NOT NULL,
	[NotificationDesc] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NOT NULL,
	[RaiseBy] [nvarchar](50) NOT NULL,
	[LineID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[Category] [nvarchar](50) NOT NULL,
	[Role] [nvarchar](50) NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Notifica__20CF2E32A1CBDAA2] PRIMARY KEY CLUSTERED 
(
	[NotificationID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Perf_Downtime]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Perf_Downtime](
	[DowntimeID] [int] IDENTITY(1,1) NOT NULL,
	[TimeStamp] [datetime] NULL,
	[SubAsslyLineID] [int] NULL,
	[StationID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[CurrentDT] [int] NULL,
	[TotalDT] [int] NULL,
	[LossID] [int] NULL,
	[SubLossID] [int] NULL,
	[4MLossID] [int] NULL,
	[UserID] [nvarchar](50) NULL,
	[Reason] [nvarchar](max) NULL,
	[LastUpdatedTime] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DowntimeID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Perf_Hourly_OLE]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Perf_Hourly_OLE](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[LineID] [int] NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[TotalTime] [datetime] NULL,
	[TotalDownTime] [int] NULL,
	[AvailableTime] [int] NULL,
	[PlannedQuantity] [int] NULL,
	[ExpectedQuantity] [int] NULL,
	[TotalQuantity] [int] NULL,
	[GoodQuantity] [int] NULL,
	[RejectionQuantity] [int] NULL,
	[Availability] [decimal](5, 2) NULL,
	[Performance] [decimal](5, 2) NULL,
	[Quality] [decimal](5, 2) NULL,
	[OLE] [decimal](5, 2) NULL,
 CONSTRAINT [PK__Perf_Hou__C5B196023B5FBFD8] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Perf_OLE]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Perf_OLE](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[LineID] [int] NOT NULL,
	[SubAsslyLineID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[TotalTime] [datetime] NULL,
	[TotalDownTime] [int] NULL,
	[AvailableTime] [int] NULL,
	[PlannedQuantity] [int] NULL,
	[ExpectedQuantity] [int] NULL,
	[TotalQuantity] [int] NULL,
	[GoodQuantity] [int] NULL,
	[RejectionQuantity] [int] NULL,
	[Availability] [decimal](5, 2) NULL,
	[Performance] [decimal](5, 2) NULL,
	[Quality] [decimal](5, 2) NULL,
	[OLE] [decimal](5, 2) NULL,
 CONSTRAINT [PK__Perf_OLE__C5B196028BC46B3A] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Perf_PlannedShutDown]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Perf_PlannedShutDown](
	[UID] [bigint] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[LineID] [int] NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NULL,
	[ShutdownReason] [nvarchar](300) NULL,
	[ShutDownStatus] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Activity_Data_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Activity_Data_Log](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[ActivityID] [int] NULL,
	[TimeStamp] [datetime] NULL,
	[EINNO] [int] NULL,
	[Activity_Data_Val] [nvarchar](100) NULL,
	[Activity_Status] [int] NULL,
	[StageNo] [int] NULL,
	[Count] [int] NULL,
	[SequenceID] [int] NULL,
 CONSTRAINT [PK_Prod_Activity_Data_Log] PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Activity_Data_Log_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Activity_Data_Log_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[ActivityID] [int] NULL,
	[TimeStamp] [datetime] NULL,
	[EINNO] [int] NULL,
	[Activity_Data_Val] [nvarchar](100) NULL,
	[Activity_Status] [int] NULL,
	[StageNo] [int] NULL,
	[Count] [int] NULL,
	[SequenceID] [int] NULL,
 CONSTRAINT [PK_Prod_Activity_Data_Log_History] PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_BB_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_BB_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_BB_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_BB_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_BB_PlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_BB_PlanExecution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_BB___C5B196022524E48B] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_BB_PlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_BB_PlanExecutionHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_BB___C5B196022112541D] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Call_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Call_Log](
	[RowId] [int] IDENTITY(1,1) NOT NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[StartTime] [datetime] NULL,
	[AckTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[CallStatus] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[RowId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCLH_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCLH_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCLH_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCLH_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCLH_PlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCLH_PlanExecution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CCL__C5B1960260AE4045] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCLH_PlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCLH_PlanExecutionHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CCL__C5B19602C375243C] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCRH_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCRH_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCRH_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCRH_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCRH_PlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCRH_PlanExecution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CCR__C5B1960250F72623] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CCRH_PlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CCRH_PlanExecutionHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CCR__C5B1960227EA047D] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CHD_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CHD_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CHD_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CHD_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[SA_SerialNo] [nvarchar](14) NOT NULL,
	[PlanID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CHD_PlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CHD_PlanExecution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CH___C5B19602B3986807] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_CHD_PlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_CHD_PlanExecutionHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_CH___C5B19602FCFAD746] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_DailyOperatorPlan]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_DailyOperatorPlan](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [nvarchar](50) NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](50) NULL,
	[UserStatus] [int] NULL,
	[LastUpdatedTime] [datetime] NULL,
	[LastUpdatedBy] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Defect_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Defect_Log](
	[DefectLogID] [int] IDENTITY(1,1) NOT NULL,
	[TimeStamp] [datetime] NULL,
	[InspectionPointID] [int] NULL,
	[DefectID] [int] NULL,
	[EngineNo] [nvarchar](14) NULL,
	[Remark] [nvarchar](max) NULL,
	[Status] [int] NULL,
	[UpdatedBy] [nvarchar](50) NULL,
	[LastUpdatedTime] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[DefectLogID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_DefectAction_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_DefectAction_Log](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
	[DefectLogID] [int] NOT NULL,
	[ActionID] [int] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[Remark] [nvarchar](max) NULL,
	[Status] [int] NOT NULL,
	[UpdatedBy] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Engine_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Engine_Geneology](
	[RowID] [bigint] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Count] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Engine_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Engine_Geneology_History](
	[RowID] [bigint] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[StationID] [int] NOT NULL,
	[ActivityID] [int] NOT NULL,
	[ActivityValue] [nvarchar](50) NULL,
	[Count] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[UsersID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Engine_SKU_Execution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Engine_SKU_Execution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[SKUName] [nvarchar](100) NOT NULL,
	[Month] [int] NOT NULL,
	[Year] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK_Prod_Engine_SKU_Execution] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Engine_WIP]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Engine_WIP](
	[VREngineNo] [nvarchar](10) NOT NULL,
	[EngineNo] [nvarchar](14) NULL,
	[PlanID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[LineID] [int] NOT NULL,
	[KITID] [nvarchar](10) NOT NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[Status] [int] NOT NULL,
	[NotOkStation] [int] NULL,
	[ReEntryStation] [int] NULL,
	[SAMarrigeStatus] [int] NULL,
 CONSTRAINT [PK_Prod_Engine_WIP] PRIMARY KEY CLUSTERED 
(
	[VREngineNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UQ_Prod_Engine_WIP_EngineNo] UNIQUE NONCLUSTERED 
(
	[EngineNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Engine_WIPHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Engine_WIPHistory](
	[VREngineNo] [nvarchar](10) NOT NULL,
	[EngineNo] [nvarchar](14) NULL,
	[PlanID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[LineID] [int] NOT NULL,
	[KITID] [nvarchar](10) NOT NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[Status] [int] NULL,
	[NotOkStation] [int] NULL,
	[ReEntryStation] [int] NULL,
	[SAMarrigeStatus] [int] NULL,
 CONSTRAINT [PK_Prod_Engine_WIPHistory] PRIMARY KEY CLUSTERED 
(
	[VREngineNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_EnginePlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_EnginePlanExecution](
	[PlanID] [int] NOT NULL,
	[LineID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[Priority] [int] NULL,
	[PlanQty] [int] NOT NULL,
	[KitAssembly_Qty] [int] NOT NULL,
	[KitInspected_Qty] [int] NOT NULL,
	[ENGMainLine_Qty] [int] NOT NULL,
	[ENGNotOK_Qty] [int] NOT NULL,
	[ENGNotOKBypass_Qty] [int] NOT NULL,
	[ENGTakeOut_Qty] [int] NOT NULL,
	[ENGReworkOK_Qty] [int] NOT NULL,
	[ENGCompleted_Qty] [int] NOT NULL,
	[ENGMaterialHold_Qty] [int] NOT NULL,
	[ENGQualityHold_Qty] [int] NOT NULL,
	[ENGScrapped_Qty] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[LineSpeed] [int] NOT NULL,
 CONSTRAINT [PK__Prod_Eng__755C22D7A74DE572] PRIMARY KEY CLUSTERED 
(
	[PlanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_EnginePlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_EnginePlanExecutionHistory](
	[PlanID] [int] NOT NULL,
	[LineID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[Priority] [int] NULL,
	[PlanQty] [int] NOT NULL,
	[KitAssembly_Qty] [int] NOT NULL,
	[KitInspected_Qty] [int] NOT NULL,
	[ENGMainLine_Qty] [int] NOT NULL,
	[ENGNotOK_Qty] [int] NOT NULL,
	[ENGNotOKBypass_Qty] [int] NOT NULL,
	[ENGTakeOut_Qty] [int] NOT NULL,
	[ENGReworkOK_Qty] [int] NOT NULL,
	[ENGCompleted_Qty] [int] NOT NULL,
	[ENGFGEngine_Qty] [int] NOT NULL,
	[ENGMaterialHold_Qty] [int] NOT NULL,
	[ENGQualityHold_Qty] [int] NOT NULL,
	[ENGScrapped_Qty] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[LineSpeed] [int] NOT NULL,
 CONSTRAINT [PK__Prod_Eng__755C22D7ABAB745B] PRIMARY KEY CLUSTERED 
(
	[PlanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Inspection_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Inspection_Log](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[InspectionPointID] [int] NULL,
	[EngineNo] [nvarchar](14) NULL,
	[Result] [int] NULL,
	[InspectedBy] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_InTake_PlanExecution]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_InTake_PlanExecution](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_InT__C5B196026E593305] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_InTake_PlanExecutionHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_InTake_PlanExecutionHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SKUID] [int] NOT NULL,
	[PlanID] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Planned] [int] NOT NULL,
	[InProcess] [int] NOT NULL,
	[Completed] [int] NOT NULL,
	[Married] [int] NOT NULL,
	[RejectedQty] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__Prod_InT__C5B196026F16FA0A] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_OperatorOverTime]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_OperatorOverTime](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[UserID] [nvarchar](50) NULL,
	[OverTime] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_OperatorStationMapping]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_OperatorStationMapping](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [nvarchar](50) NULL,
	[StationID] [int] NULL,
	[UserSkillTotal] [int] NULL,
	[PreferredStation] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Plan]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Plan](
	[PlanID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[PlanQty] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Source] [int] NOT NULL,
	[LineSpeed] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PlanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Plan_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Plan_History](
	[PlanID] [int] NOT NULL,
	[LineID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
	[PlanQty] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[Priority] [int] NOT NULL,
	[Source] [int] NOT NULL,
	[LineSpeed] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[PlanID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_PY_Bypass_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_PY_Bypass_Log](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[ActivityID] [int] NULL,
	[Status] [int] NULL,
	[Remark] [nvarchar](300) NULL,
	[UserID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_SA_Buffer]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_SA_Buffer](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[SubAsslyLineID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_SA_WIP]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_SA_WIP](
	[VSA_SerialNo] [nvarchar](10) NOT NULL,
	[SA_SerialNo] [nvarchar](14) NULL,
	[PlanID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[SubAsslyLineID] [int] NOT NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK_Prod_SA_WIP] PRIMARY KEY CLUSTERED 
(
	[VSA_SerialNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_SA_WIPHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_SA_WIPHistory](
	[VSA_SerialNo] [nvarchar](10) NOT NULL,
	[SA_SerialNo] [nvarchar](14) NULL,
	[PlanID] [int] NOT NULL,
	[SKUID] [int] NOT NULL,
	[SubAsslyLineID] [int] NOT NULL,
	[StartTime] [datetime] NULL,
	[EndTime] [datetime] NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK_Prod_SA_WIPHistory] PRIMARY KEY CLUSTERED 
(
	[VSA_SerialNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_ShiftOperatorAssignment]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_ShiftOperatorAssignment](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[UserID] [nvarchar](50) NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[UserStatus] [int] NULL,
	[AssignmentTimestamp] [datetime] NULL,
	[LoggedInTimeStamp] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_ShiftOperatorAssignmentHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_ShiftOperatorAssignmentHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[UserID] [nvarchar](50) NULL,
	[UserStatus] [int] NULL,
	[AssignmentTimestamp] [datetime] NULL,
	[LoggedInTimeStamp] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_ShiftOperatorChangeHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_ShiftOperatorChangeHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[OldUserID] [nvarchar](50) NULL,
	[NewUserID] [nvarchar](50) NULL,
	[Reason] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_ShiftPlan_Change_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_ShiftPlan_Change_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[PlanID] [int] NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
	[FieldName] [nvarchar](100) NOT NULL,
	[OldValue] [nvarchar](max) NULL,
	[NewValue] [nvarchar](max) NULL,
	[Status] [int] NOT NULL,
	[Remark] [nvarchar](max) NULL,
	[UpdatedBy] [nvarchar](100) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_ShiftStationOperatorPlan]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_ShiftStationOperatorPlan](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NULL,
	[StationID] [int] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[ProdDate] [date] NULL,
	[UserID] [nvarchar](50) NULL,
	[LastUpdatedTime] [datetime] NULL,
	[LastUpdatedBy] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Station_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Station_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[StationID] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[UserID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Station_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Station_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[StationID] [int] NOT NULL,
	[Status] [int] NOT NULL,
	[UserID] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Status_Geneology]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Status_Geneology](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[Status] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_Status_Geneology_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_Status_Geneology_History](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[Status] [int] NOT NULL,
	[ProdDate] [date] NOT NULL,
	[ProdShift] [nvarchar](10) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_TorqueData_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_TorqueData_Log](
	[RowID] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NULL,
	[SKUID] [int] NULL,
	[ActivityID] [int] NULL,
	[ActivityValue] [decimal](5, 2) NULL,
	[Angle] [int] NULL,
	[Rundown] [decimal](5, 2) NULL,
	[CycleTime] [int] NULL,
	[Count] [nvarchar](50) NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED 
(
	[RowID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_WeeklyOperatorPlan]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_WeeklyOperatorPlan](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[ProdShift] [nvarchar](10) NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[UserID] [nvarchar](50) NULL,
	[LastUpdatedTime] [datetime] NULL,
	[LastUpdatedBy] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Prod_WeeklyOperatorPlanTemp]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Prod_WeeklyOperatorPlanTemp](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[ProdShift] [nvarchar](10) NULL,
	[StartDate] [date] NOT NULL,
	[EndDate] [date] NOT NULL,
	[UserID] [nvarchar](50) NULL,
	[LastUpdatedTime] [datetime] NULL,
	[LastUpdatedBy] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_AuditHistory]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_AuditHistory](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NOT NULL,
	[AuditListID] [int] NULL,
	[AuditInstanceID] [int] NOT NULL,
	[StartDateTime] [datetime] NOT NULL,
	[EndDateTime] [datetime] NOT NULL,
	[ActualStartDateTime] [datetime] NULL,
	[ActualEndDateTime] [datetime] NULL,
	[Notification] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__AuditHis__C5B196027A6A95F5] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_AuditMonitoring]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_AuditMonitoring](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[LineID] [int] NOT NULL,
	[AuditListID] [int] NULL,
	[AuditInstanceID] [int] NOT NULL,
	[StartDateTime] [datetime] NOT NULL,
	[EndDateTime] [datetime] NOT NULL,
	[ActualStartDateTime] [datetime] NULL,
	[ActualEndDateTime] [datetime] NULL,
	[Notification] [int] NOT NULL,
	[Status] [int] NOT NULL,
 CONSTRAINT [PK__AuditMon__C5B196026D7A7931] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_DocumentList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_DocumentList](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[DocumentID] [int] NULL,
	[DocumentNo] [int] NULL,
	[DocumentName] [nvarchar](100) NULL,
	[AuditGroup] [nvarchar](100) NULL,
	[Revision] [int] NULL,
	[AuditInstanceID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_DocumentList_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_DocumentList_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[DocumentID] [int] NULL,
	[DocumentNo] [int] NULL,
	[DocumentName] [nvarchar](100) NULL,
	[AuditGroup] [nvarchar](100) NULL,
	[Revision] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Status] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_AuditList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_AuditList](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602257DFD84] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_AuditList_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_AuditList_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602980BE141] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngFiringAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngFiringAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngFiringAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngFiringAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[LLPowerValue] [decimal](5, 2) NULL,
	[ULPowerValue] [decimal](5, 2) NULL,
	[ObservationPowerValue] [decimal](5, 2) NULL,
	[ObservationPowerValueResult] [int] NULL,
	[ObservationPowerValueRemark] [nvarchar](max) NULL,
	[PowerRPM] [int] NULL,
	[ObservationPowerRPMValue] [decimal](5, 2) NULL,
	[ObservationPowerRPMResult] [int] NULL,
	[ObservationPowerRPMRemark] [nvarchar](max) NULL,
	[LLTorqueValue] [decimal](5, 2) NULL,
	[ULTorqueValue] [decimal](5, 2) NULL,
	[ObservationTorqueValue] [decimal](5, 2) NULL,
	[ObservationTorqueValueResult] [int] NULL,
	[ObservationTorqueValueRemark] [nvarchar](max) NULL,
	[TorqueRPM] [int] NULL,
	[ObservationTorqueRPMValue] [decimal](5, 2) NULL,
	[ObservationTorqueRPMResult] [int] NULL,
	[ObservationTorqueRPMRemark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[LLPowerValue] [decimal](5, 2) NULL,
	[ULPowerValue] [decimal](5, 2) NULL,
	[ObservationPowerValue] [decimal](5, 2) NULL,
	[ObservationPowerValueResult] [int] NULL,
	[ObservationPowerValueRemark] [nvarchar](max) NULL,
	[PowerRPM] [int] NULL,
	[ObservationPowerRPMValue] [decimal](5, 2) NULL,
	[ObservationPowerRPMResult] [int] NULL,
	[ObservationPowerRPMRemark] [nvarchar](max) NULL,
	[LLTorqueValue] [decimal](5, 2) NULL,
	[ULTorqueValue] [decimal](5, 2) NULL,
	[ObservationTorqueValue] [decimal](5, 2) NULL,
	[ObservationTorqueValueResult] [int] NULL,
	[ObservationTorqueValueRemark] [nvarchar](max) NULL,
	[TorqueRPM] [int] NULL,
	[ObservationTorqueRPMValue] [decimal](5, 2) NULL,
	[ObservationTorqueRPMResult] [int] NULL,
	[ObservationTorqueRPMRemark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngStripAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngStripAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_FQC_EngStripAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_FQC_EngStripAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[UpperLimit] [decimal](5, 2) NULL,
	[LowerLimit] [decimal](5, 2) NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_AuditList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_AuditList](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602CC4C9D8A] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_AuditList_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_AuditList_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B196020D4FC70F] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_ManagerAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_ManagerAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_ManagerAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_ManagerAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PartPressAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PartPressAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PartPressAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PartPressAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PYMachineAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PYMachineAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ActivityUID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PYMachineAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PYMachineAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ActivityUID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ActivityUID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ActivityUID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_SOPAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_SOPAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_SOPAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_SOPAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_TorqueAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_TorqueAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IPQC_TorqueAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IPQC_TorqueAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditPointID] [int] NULL,
	[AuditListID] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[Status] [int] NULL,
	[AuditInstanceID] [int] NULL,
	[Revision] [int] NULL,
	[TicketID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_AuditList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_AuditList](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[BatchID] [nvarchar](20) NULL,
	[PartScanID] [nvarchar](20) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[NokSample] [int] NULL,
	[Status] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602DBE5556C] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_AuditList_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_AuditList_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[ModelFamilyID] [int] NULL,
	[ModelID] [int] NULL,
	[SKUID] [int] NULL,
	[PartID] [nvarchar](20) NULL,
	[VendorID] [int] NULL,
	[BatchID] [nvarchar](20) NULL,
	[PartScanID] [nvarchar](20) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[NokSample] [int] NULL,
	[Result] [int] NULL,
	[ProdDate] [date] NULL,
	[ProdShift] [nvarchar](10) NULL,
	[AuditInstanceID] [int] NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602F12C4CE1] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_MiliporeAuditpoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_MiliporeAuditpoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[AuditPointID] [int] NULL,
	[PartScanID] [nvarchar](20) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[AuditInstanceID] [int] NULL,
	[Status] [int] NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B196025C9C29C6] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_MiliporeAuditpoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_MiliporeAuditpoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[AuditPointID] [int] NULL,
	[PartScanID] [nvarchar](20) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[AuditInstanceID] [int] NULL,
	[Status] [int] NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B19602E3BBA1A3] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_VisualInspectAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_VisualInspectAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[AuditPointID] [int] NULL,
	[PartScanID] [nvarchar](20) NULL,
	[Aspect] [nvarchar](50) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[AuditInstanceID] [int] NULL,
	[Status] [int] NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B196028D8A9FFE] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_IQC_VisualInspectAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_IQC_VisualInspectAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NULL,
	[AuditPointID] [int] NULL,
	[PartScanID] [nvarchar](20) NULL,
	[Aspect] [nvarchar](50) NULL,
	[SampleLevel] [int] NULL,
	[SampleSize] [int] NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[Timestamp] [datetime] NULL,
	[AuditInstanceID] [int] NULL,
	[Status] [int] NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__Execute___C5B1960296CF912E] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_AuditList]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_AuditList](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[Result] [int] NULL,
	[AuditInstanceID] [int] NOT NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__QA_Execu__C5B19602E08ADA75] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_AuditList_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_AuditList_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[Result] [int] NULL,
	[AuditInstanceID] [int] NOT NULL,
	[ExecutedStartTime] [datetime] NULL,
	[ExecutedBy] [nvarchar](100) NULL,
	[ExecutedEndTime] [datetime] NULL,
	[ExecutedByRemark] [nvarchar](max) NULL,
	[ApprovedBy] [nvarchar](100) NULL,
	[ApprovedTime] [datetime] NULL,
	[ApprovedByRemark] [nvarchar](max) NULL,
	[ReviewBy] [nvarchar](100) NULL,
	[ReviewTime] [datetime] NULL,
	[ReviewByRemark] [nvarchar](max) NULL,
	[Revision] [int] NULL,
 CONSTRAINT [PK__QA_Execu__C5B196021A5DC9B9] PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_ChecklistMetaData]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_ChecklistMetaData](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[MetaDataName] [nvarchar](100) NULL,
	[MetaDataValue] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_ChecklistMetaData_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_ChecklistMetaData_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[MetaDataName] [nvarchar](100) NULL,
	[MetaDataValue] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_InspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_InspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_InspectionAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_InspectionAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_IPOAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_IPOAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_IPOAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_IPOAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint_History]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint_History](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[AuditListID] [int] NOT NULL,
	[AuditPointID] [int] NOT NULL,
	[ObservationValue] [decimal](5, 2) NULL,
	[Result] [int] NULL,
	[Remark] [nvarchar](max) NULL,
	[TimeStamp] [datetime] NULL,
	[Status] [int] NOT NULL,
	[AuditInstanceID] [int] NOT NULL,
	[Revision] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SAP_Engine_SKU_Data]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SAP_Engine_SKU_Data](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[EngineNo] [nvarchar](14) NOT NULL,
	[SKUName] [nvarchar](100) NOT NULL,
	[Status] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED 
(
	[EngineNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SAP_Table]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SAP_Table](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[ReceivingQty] [int] NOT NULL,
	[ValidatedQty] [int] NOT NULL,
	[EDINumber] [nvarchar](20) NOT NULL,
	[VendorID] [int] NOT NULL,
	[PartID] [nvarchar](20) NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[SP_Error_Log]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[SP_Error_Log](
	[ErrorID] [bigint] IDENTITY(1,1) NOT NULL,
	[ErrorTimestamp] [datetime] NOT NULL,
	[ErrorNumber] [int] NULL,
	[ErrorState] [int] NULL,
	[ErrorSeverity] [int] NULL,
	[ErrorLine] [int] NULL,
	[ErrorProc] [varchar](50) NULL,
	[ErrorMsg] [nvarchar](max) NULL,
 CONSTRAINT [PK_SP_Error_Log] PRIMARY KEY CLUSTERED 
(
	[ErrorID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TicketManagement]    Script Date: 8/10/2026 1:55:28 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TicketManagement](
	[UID] [int] IDENTITY(1,1) NOT NULL,
	[TicketID] [int] NOT NULL,
	[TimeStamp] [datetime] NOT NULL,
	[LineID] [int] NOT NULL,
	[StationID] [int] NOT NULL,
	[RaiseBy] [nvarchar](50) NOT NULL,
	[Reason] [nvarchar](max) NULL,
	[ActionBy] [nvarchar](50) NOT NULL,
	[Remark] [nvarchar](max) NULL,
	[TrackingStatus] [int] NOT NULL,
	[ExpectedClosure] [date] NULL,
	[TicketStatus] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[UID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[BarcodeReprintLog] ADD  CONSTRAINT [DF_BarcodeReprintLog_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Config_Activity] ADD  CONSTRAINT [DF__Config_Ac__Count__0B129727]  DEFAULT ((1)) FOR [Count]
GO
ALTER TABLE [dbo].[Config_FQC_EngFiringAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_FQC_EngInbuiltAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_FQC_EngPerformanceAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_FQC_EngStripAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_ManagerAuditPoint] ADD  CONSTRAINT [DF__Config_IP__Statu__05F8DC4F]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_PartPressAuditPoint] ADD  CONSTRAINT [DF__Config_IP__Statu__01342732]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_PYMachineAuditPoint] ADD  CONSTRAINT [DF__Config_IP__Statu__77AABCF8]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_PYOnlineAuditPoint] ADD  CONSTRAINT [DF__Config_IP__Statu__7C6F7215]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_SOPAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IPQC_TorqueAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IQC_MiliporeAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_IQC_VisualInspectAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_Vendor] ADD  CONSTRAINT [DF__Config_Ve__Vendo__505BE5AD]  DEFAULT ((1)) FOR [VendorStatus]
GO
ALTER TABLE [dbo].[Config_Vendor_InspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_Vendor_IPOAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_Vendor_PartInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_Vendor_ProcessInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Config_Vendor_SampleInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[Maint_ActiveAlarm] ADD  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Maint_AlarmLog] ADD  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Material_KitbinHistory] ADD  CONSTRAINT [DF_Material_KitbinHistory_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Material_Movement_Log] ADD  CONSTRAINT [DF_Material_Movement_Log_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_ValidatedQty]  DEFAULT ((0)) FOR [ValidatedQty]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_OKQty]  DEFAULT ((0)) FOR [OKQty]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_RejectedQty]  DEFAULT ((0)) FOR [RejectedQty]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_HoldQty]  DEFAULT ((0)) FOR [HoldQty]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_SampleQty]  DEFAULT ((0)) FOR [SampleQty]
GO
ALTER TABLE [dbo].[Material_Receiving] ADD  CONSTRAINT [DF_Material_Receiving_SampleLevel]  DEFAULT ((0)) FOR [SampleLevel]
GO
ALTER TABLE [dbo].[Material_Receiving_Geneology] ADD  DEFAULT (getdate()) FOR [LastUpdatedTime]
GO
ALTER TABLE [dbo].[Material_Receiving_History] ADD  CONSTRAINT [DF_Material_Receiving_History_OKQty]  DEFAULT ((0)) FOR [OKQty]
GO
ALTER TABLE [dbo].[Material_Receiving_History] ADD  CONSTRAINT [DF_Material_Receiving_History_RejectedQty]  DEFAULT ((0)) FOR [RejectedQty]
GO
ALTER TABLE [dbo].[Material_Receiving_History] ADD  CONSTRAINT [DF_Material_Receiving_History_HoldQty]  DEFAULT ((0)) FOR [HoldQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_IncomingQty]  DEFAULT ((0)) FOR [IncomingQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_StoreQty]  DEFAULT ((0)) FOR [StoreQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineCKitRackQty]  DEFAULT ((0)) FOR [LineCKitRackQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineDKitRackQty]  DEFAULT ((0)) FOR [LineDKitRackQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineCMaterialOnKit]  DEFAULT ((0)) FOR [LineCMaterialOnKit]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineDMaterialOnKit]  DEFAULT ((0)) FOR [LineDMaterialOnKit]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineCQty]  DEFAULT ((0)) FOR [LineCQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LineDQty]  DEFAULT ((0)) FOR [LineDQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LinesideCQty]  DEFAULT ((0)) FOR [LinesideCQty]
GO
ALTER TABLE [dbo].[Material_Stock] ADD  CONSTRAINT [DF_Material_Stock_LinesideDQty]  DEFAULT ((0)) FOR [LinesideDQty]
GO
ALTER TABLE [dbo].[NotificationManagement] ADD  CONSTRAINT [DF__Notificat__TimeS__3B8BB150]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Prod_BB_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_BB_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecution] ADD  CONSTRAINT [DF__Prod_BB_P__Plann__2354350C]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecution] ADD  CONSTRAINT [DF__Prod_BB_P__InPro__24485945]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecution] ADD  CONSTRAINT [DF__Prod_BB_P__Compl__253C7D7E]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecution] ADD  CONSTRAINT [DF__Prod_BB_P__Marri__2630A1B7]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_BB_P__Plann__347EC10E]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_BB_P__InPro__3572E547]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_BB_P__Compl__36670980]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_BB_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_BB_P__Marri__375B2DB9]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CCLH_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CCLH_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCLH__Plann__06B7F65E]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCLH__InPro__07AC1A97]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCLH__Compl__08A03ED0]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCLH__Marri__09946309]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCLH__Plann__3E082B48]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCLH__InPro__3EFC4F81]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCLH__Compl__3FF073BA]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CCLH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCLH__Marri__40E497F3]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CCRH_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CCRH_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCRH__Plann__10416098]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCRH__InPro__113584D1]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCRH__Compl__1229A90A]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecution] ADD  CONSTRAINT [DF__Prod_CCRH__Marri__131DCD43]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCRH__Plann__47919582]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCRH__InPro__4885B9BB]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCRH__Compl__4979DDF4]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CCRH_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CCRH__Marri__4A6E022D]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CHD_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CHD_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecution] ADD  CONSTRAINT [DF__Prod_CH_P__Plann__19CACAD2]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecution] ADD  CONSTRAINT [DF__Prod_CH_P__InPro__1ABEEF0B]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecution] ADD  CONSTRAINT [DF__Prod_CH_P__Compl__1BB31344]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecution] ADD  CONSTRAINT [DF__Prod_CH_P__Marri__1CA7377D]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CH_P__Plann__511AFFBC]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CH_P__InPro__520F23F5]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CH_P__Compl__5303482E]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_CHD_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_CH_P__Marri__53F76C67]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_DefectAction_Log] ADD  CONSTRAINT [DF_Prod_DefectAction_Log_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Prod_Engine_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_Engine_Geneology] ADD  DEFAULT ((1)) FOR [Count]
GO
ALTER TABLE [dbo].[Prod_Engine_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_Engine_Geneology_History] ADD  DEFAULT ((1)) FOR [Count]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__PlanQ__71BCD978]  DEFAULT ((0)) FOR [PlanQty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__KitAs__72B0FDB1]  DEFAULT ((0)) FOR [KitAssembly_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__KitIn__73A521EA]  DEFAULT ((0)) FOR [KitInspected_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGMa__74994623]  DEFAULT ((0)) FOR [ENGMainLine_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGNo__758D6A5C]  DEFAULT ((0)) FOR [ENGNotOK_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGNo__76818E95]  DEFAULT ((0)) FOR [ENGNotOKBypass_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGTa__7775B2CE]  DEFAULT ((0)) FOR [ENGTakeOut_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGRe__7869D707]  DEFAULT ((0)) FOR [ENGReworkOK_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGCo__795DFB40]  DEFAULT ((0)) FOR [ENGCompleted_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGMa__7B4643B2]  DEFAULT ((0)) FOR [ENGMaterialHold_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGQu__7C3A67EB]  DEFAULT ((0)) FOR [ENGQualityHold_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecution] ADD  CONSTRAINT [DF__Prod_Engi__ENGSc__7D2E8C24]  DEFAULT ((0)) FOR [ENGScrapped_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__PlanQ__5AA469F6]  DEFAULT ((0)) FOR [PlanQty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__KitAs__5B988E2F]  DEFAULT ((0)) FOR [KitAssembly_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__KitIn__5C8CB268]  DEFAULT ((0)) FOR [KitInspected_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGMa__5D80D6A1]  DEFAULT ((0)) FOR [ENGMainLine_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGNo__5E74FADA]  DEFAULT ((0)) FOR [ENGNotOK_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGNo__5F691F13]  DEFAULT ((0)) FOR [ENGNotOKBypass_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGTa__605D434C]  DEFAULT ((0)) FOR [ENGTakeOut_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGRe__61516785]  DEFAULT ((0)) FOR [ENGReworkOK_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGCo__62458BBE]  DEFAULT ((0)) FOR [ENGCompleted_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGFG__6339AFF7]  DEFAULT ((0)) FOR [ENGFGEngine_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGMa__642DD430]  DEFAULT ((0)) FOR [ENGMaterialHold_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGQu__6521F869]  DEFAULT ((0)) FOR [ENGQualityHold_Qty]
GO
ALTER TABLE [dbo].[Prod_EnginePlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_Engi__ENGSc__66161CA2]  DEFAULT ((0)) FOR [ENGScrapped_Qty]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecution] ADD  CONSTRAINT [DF__Prod_InTa__Plann__74C42EAC]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecution] ADD  CONSTRAINT [DF__Prod_InTa__InPro__75B852E5]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecution] ADD  CONSTRAINT [DF__Prod_InTa__Compl__76AC771E]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecution] ADD  CONSTRAINT [DF__Prod_InTa__Marri__77A09B57]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecution] ADD  CONSTRAINT [DF__Prod_InTa__Rejec__7894BF90]  DEFAULT ((0)) FOR [RejectedQty]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_InTa__Plann__0406723C]  DEFAULT ((0)) FOR [Planned]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_InTa__InPro__04FA9675]  DEFAULT ((0)) FOR [InProcess]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_InTa__Compl__05EEBAAE]  DEFAULT ((0)) FOR [Completed]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_InTa__Marri__06E2DEE7]  DEFAULT ((0)) FOR [Married]
GO
ALTER TABLE [dbo].[Prod_InTake_PlanExecutionHistory] ADD  CONSTRAINT [DF__Prod_InTa__Rejec__07D70320]  DEFAULT ((0)) FOR [RejectedQty]
GO
ALTER TABLE [dbo].[Prod_ShiftPlan_Change_History] ADD  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[Prod_Station_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_Station_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_Status_Geneology] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[Prod_Status_Geneology_History] ADD  DEFAULT (getdate()) FOR [Timestamp]
GO
ALTER TABLE [dbo].[QA_Execute_DocumentList_History] ADD  CONSTRAINT [DF_QA_Execute_DocumentList_History_Status]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngFiringAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngFiringAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngInbuiltAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngPerformanceAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngStripAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_FQC_EngStripAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_ManagerAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_ManagerAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PartPressAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PartPressAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PYMachineAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PYMachineAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_PYOnlineAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_SOPAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_SOPAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_TorqueAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IPQC_TorqueAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IQC_MiliporeAuditpoint] ADD  CONSTRAINT [DF__Execute_I__Statu__13C7D8B9]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IQC_MiliporeAuditpoint_History] ADD  CONSTRAINT [DF__Execute_I__Statu__1F398B65]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IQC_VisualInspectAuditPoint] ADD  CONSTRAINT [DF__Execute_I__Statu__1798699D]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_IQC_VisualInspectAuditPoint_History] ADD  CONSTRAINT [DF__Execute_I__Statu__1B68FA81]  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_InspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_InspectionAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_IPOAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_IPOAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_PartInspectionAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_ProcessInspectionAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[QA_Execute_Vendor_SampleInspectionAuditPoint_History] ADD  DEFAULT ((1)) FOR [Status]
GO
ALTER TABLE [dbo].[SAP_Table] ADD  CONSTRAINT [DF_SAP_Table_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[SP_Error_Log] ADD  CONSTRAINT [DF__SP_Error___Error__4F47C5E3]  DEFAULT (getdate()) FOR [ErrorTimestamp]
GO
ALTER TABLE [dbo].[TicketManagement] ADD  CONSTRAINT [DF_TicketManagement_TimeStamp]  DEFAULT (getdate()) FOR [TimeStamp]
GO
ALTER TABLE [dbo].[ApplicationSetting]  WITH CHECK ADD  CONSTRAINT [FK_Prod_ShiftInformation_Config_Line] FOREIGN KEY([LineID])
REFERENCES [dbo].[Config_Line] ([LineID])
GO
ALTER TABLE [dbo].[ApplicationSetting] CHECK CONSTRAINT [FK_Prod_ShiftInformation_Config_Line]
GO
ALTER TABLE [dbo].[BarcodeReprintLog]  WITH CHECK ADD  CONSTRAINT [FK_BarcodeReprintLog_User] FOREIGN KEY([UserID])
REFERENCES [dbo].[Config_User] ([UserID])
GO
ALTER TABLE [dbo].[BarcodeReprintLog] CHECK CONSTRAINT [FK_BarcodeReprintLog_User]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_Config_SubAsslyLineID] FOREIGN KEY([SubAsslyLineID])
REFERENCES [dbo].[Config_SubAssemblyLine] ([SubAsslyLineID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_Config_SubAsslyLineID]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_Equipment] FOREIGN KEY([EquipmentID])
REFERENCES [dbo].[Config_Equipment] ([EquipmentID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_Equipment]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_Model] FOREIGN KEY([ModelID])
REFERENCES [dbo].[Config_Model] ([ModelID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_Model]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_ModelFamily] FOREIGN KEY([ModelFamilyID])
REFERENCES [dbo].[Config_ModelFamily] ([ModelFamilyID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_ModelFamily]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_SKU] FOREIGN KEY([SKUID])
REFERENCES [dbo].[Config_SKU] ([SKUID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_SKU]
GO
ALTER TABLE [dbo].[Config_Activity]  WITH NOCHECK ADD  CONSTRAINT [FK_Config_Activity_Station] FOREIGN KEY([StationID])
REFERENCES [dbo].[Config_Station] ([StationID])
GO
ALTER TABLE [dbo].[Config_Activity] CHECK CONSTRAINT [FK_Config_Activity_Station]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_ActivityID] FOREIGN KEY([ActivityID])
REFERENCES [dbo].[Config_Activity] ([UID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_ActivityID]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_ModelFamilyID] FOREIGN KEY([ModelFamilyID])
REFERENCES [dbo].[Config_ModelFamily] ([ModelFamilyID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_ModelFamilyID]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_ModelID] FOREIGN KEY([ModelID])
REFERENCES [dbo].[Config_Model] ([ModelID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_ModelID]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_SKUID] FOREIGN KEY([SKUID])
REFERENCES [dbo].[Config_SKU] ([SKUID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_SKUID]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_SOPID] FOREIGN KEY([SOPID])
REFERENCES [dbo].[Config_SOPPoint] ([SOPID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_SOPID]
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping]  WITH CHECK ADD  CONSTRAINT [FK_Config_Activity_SOP_Mapping_StationID] FOREIGN KEY([StationID])
REFERENCES [dbo].[Config_Station] ([StationID])
GO
ALTER TABLE [dbo].[Config_Activity_SOP_Mapping] CHECK CONSTRAINT [FK_Config_Activity_SOP_Mapping_StationID]
GO
ALTER TABLE [dbo].[Config_Alarm]  WITH CHECK ADD  CONSTRAINT [FK_Alarm_Department] FOREIGN KEY([DepartmentID])
REFERENCES [dbo].[Config_Department] ([DepartmentID])
GO
ALTER TABLE [dbo].[Config_Alarm] CHECK CONSTRAINT [FK_Alarm_Department]
GO
ALTER TABLE [dbo].[Config_Alarm]  WITH CHECK ADD  CONSTRAINT [FK_Alarm_Equipment] FOREIGN KEY([EquipmentID])
REFERENCES [dbo].[Config_Equipment] ([EquipmentID])
GO
ALTER TABLE [dbo].[Config_Alarm] CHECK CONSTRAINT [FK_Alarm_Equipment]
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping]  WITH CHECK ADD  CONSTRAINT [FK_ConfigAuditDocumentMapping_AuditList] FOREIGN KEY([AuditListID])
REFERENCES [dbo].[Config_AuditList] ([AuditListID])
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping] CHECK CONSTRAINT [FK_ConfigAuditDocumentMapping_AuditList]
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping]  WITH CHECK ADD  CONSTRAINT [FK_ConfigAuditDocumentMapping_Model] FOREIGN KEY([Model])
REFERENCES [dbo].[Config_Model] ([ModelID])
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping] CHECK CONSTRAINT [FK_ConfigAuditDocumentMapping_Model]
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping]  WITH CHECK ADD  CONSTRAINT [FK_ConfigAuditDocumentMapping_ModelFamily] FOREIGN KEY([ModelFamily])
REFERENCES [dbo].[Config_ModelFamily] ([ModelFamilyID])
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping] CHECK CONSTRAINT [FK_ConfigAuditDocumentMapping_ModelFamily]
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping]  WITH CHECK ADD  CONSTRAINT [FK_ConfigAuditDocumentMapping_Part] FOREIGN KEY([PartID])
REFERENCES [dbo].[Config_PartVariant] ([PartID])
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping] CHECK CONSTRAINT [FK_ConfigAuditDocumentMapping_Part]
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping]  WITH CHECK ADD  CONSTRAINT [FK_ConfigAuditDocumentMapping_SKU] FOREIGN KEY([SKU])
REFERENCES [dbo].[Config_SKU] ([SKUID])
GO
ALTER TABLE [dbo].[Config_AuditDocumentMapping] CHECK CONSTRAINT [FK_ConfigAuditDocumentMapping_SKU]
GO
ALTER TABLE [dbo].[Config_AuditList]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditList_Document] FOREIGN KEY([DocumentID])
REFERENCES [dbo].[Config_QADocumentList] ([DocumentID])
GO
ALTER TABLE [dbo].[Config_AuditList] CHECK CONSTRAINT [FK_Config_AuditList_Document]
GO
ALTER TABLE [dbo].[Config_AuditList]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditList_Model] FOREIGN KEY([ModelID])
REFERENCES [dbo].[Config_Model] ([ModelID])
GO
ALTER TABLE [dbo].[Config_AuditList] CHECK CONSTRAINT [FK_Config_AuditList_Model]
GO
ALTER TABLE [dbo].[Config_AuditList]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditList_ModelFamily] FOREIGN KEY([ModelFamilyID])
REFERENCES [dbo].[Config_ModelFamily] ([ModelFamilyID])
GO
ALTER TABLE [dbo].[Config_AuditList] CHECK CONSTRAINT [FK_Config_AuditList_ModelFamily]
GO
ALTER TABLE [dbo].[Config_AuditList]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditList_Part] FOREIGN KEY([PartID])
REFERENCES [dbo].[Config_PartVariant] ([PartID])
GO
ALTER TABLE [dbo].[Config_AuditList] CHECK CONSTRAINT [FK_Config_AuditList_Part]
GO
ALTER TABLE [dbo].[Config_AuditList]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditList_SKU] FOREIGN KEY([SKUID])
REFERENCES [dbo].[Config_SKU] ([SKUID])
GO
ALTER TABLE [dbo].[Config_AuditList] CHECK CONSTRAINT [FK_Config_AuditList_SKU]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_Activity] FOREIGN KEY([ActivityID])
REFERENCES [dbo].[Config_Activity] ([UID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_Activity]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_AuditList] FOREIGN KEY([AuditListID])
REFERENCES [dbo].[Config_AuditList] ([AuditListID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_AuditList]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_Document] FOREIGN KEY([DocumentID])
REFERENCES [dbo].[Config_QADocumentList] ([DocumentID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_Document]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_EnginePart] FOREIGN KEY([EnginePartID])
REFERENCES [dbo].[Config_EnginePart] ([EnginePartID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_EnginePart]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_Parameter] FOREIGN KEY([ParameterID])
REFERENCES [dbo].[Config_Parameter] ([UID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_Parameter]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_Part] FOREIGN KEY([PartID])
REFERENCES [dbo].[Config_PartVariant] ([PartID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_Part]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_Station] FOREIGN KEY([StationID])
REFERENCES [dbo].[Config_Station] ([StationID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_Station]
GO
ALTER TABLE [dbo].[Config_AuditPointLinking]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditPointLinking_SubAsslyID] FOREIGN KEY([SubAsslyLineID])
REFERENCES [dbo].[Config_SubAssemblyLine] ([SubAsslyLineID])
GO
ALTER TABLE [dbo].[Config_AuditPointLinking] CHECK CONSTRAINT [FK_Config_AuditPointLinking_SubAsslyID]
GO
ALTER TABLE [dbo].[Config_AuditSchedule]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditSchedule_Document] FOREIGN KEY([DocumentID])
REFERENCES [dbo].[Config_QADocumentList] ([DocumentID])
GO
ALTER TABLE [dbo].[Config_AuditSchedule] CHECK CONSTRAINT [FK_Config_AuditSchedule_Document]
GO
ALTER TABLE [dbo].[Config_AuditSchedule]  WITH CHECK ADD  CONSTRAINT [FK_Config_AuditSchedule_Line] FOREIGN KEY([LineID])
REFERENCES [dbo].[Config_Line] ([LineID])
GO
ALTER TABLE [dbo].[Config_AuditSchedule] CHECK CONSTRAINT [FK_Config_AuditSchedule_Line]
GO
ALTER TABLE [dbo].[Config_BOM]  WITH CHECK ADD  CONSTRAINT [FK_Config_BOM_Config_Part] FOREIGN KEY([PreferredPartID])
REFERENCES [dbo].[Config_PartVariant] ([PartID])
GO
ALTER TABLE [dbo].[Config_BOM] CHECK CONSTRAINT [FK_Config_BOM_Config_Part]
GO
ALTER TABLE [dbo].[Config_BOM]  WITH CHECK ADD  CONSTRAINT [FK_Config_BOM_Parent_Config_Part] FOREIGN KEY([ParentID])
REFERENCES [dbo].[Config_PartVariant] ([PartID])
GO
ALTER TABLE [dbo].[Config_BOM] CHECK CONSTRAINT [FK_Config_BOM_Parent_Config_Part]
GO
ALTER TABLE [dbo].[Config_BOM]  WITH CHECK ADD  CONSTRAINT [FK_Config_BOM_Part] FOREIGN KEY([PartID])
REFERENCES [dbo]
<truncated 1323410 bytes>

NOTE: The output was truncated because it was too long. Use a more targeted query or a smaller range to get the information you need.